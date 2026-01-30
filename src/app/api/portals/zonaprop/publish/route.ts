import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Use service role key for guaranteed access
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function logToFile(message: string) {
    try {
        // Ensure logs directory exists (should be created manually if not writing perm issues)
        const logDir = path.resolve(process.cwd(), 'logs');
        if (!fs.existsSync(logDir)) {
            try { fs.mkdirSync(logDir); } catch (e) { }
        }

        const logPath = path.join(logDir, 'publish_debug.log');
        const timestamp = new Date().toISOString();
        const logLine = `[${timestamp}] ${message}\n`;
        // Append synchronously to ensure order
        fs.appendFileSync(logPath, logLine);
    } catch (e) {
        // Fallback to console if file write fails
        console.error('Failed to write log:', e);
    }
}

export async function POST(req: NextRequest) {
    logToFile('=== PUBLISH ENDPOINT HIT ===');
    try {
        const body = await req.json();
        const { propertyId, credentialsId } = body;

        logToFile(`Publish params: propertyId=${propertyId}, credentialsId=${credentialsId}`);

        // 1. Fetch credentials using service role
        const { data: creds, error: credsError } = await supabaseAdmin
            .from('portal_credentials')
            .select('*')
            .eq('id', credentialsId)
            .single();

        if (credsError || !creds) {
            logToFile(`Credentials fetch error: ${JSON.stringify(credsError)}`);
            return NextResponse.json({ error: "Unauthorized or missing credentials" }, { status: 401 });
        }
        logToFile(`Credentials found for: ${creds.username}`);

        // 2. Fetch property data
        const { data: property, error: propError } = await supabaseAdmin
            .from('properties')
            .select(`
                *,
                multimedia (
                    id,
                    url
                )
            `)
            .eq('id', propertyId)
            .single();


        if (propError || !property) {
            logToFile(`Property fetch error: ${JSON.stringify(propError)}`);
            return NextResponse.json({ error: "Property not found" }, { status: 404 });
        }
        logToFile(`Property found: ${property.address || property.zone} (ID: ${property.id})`);

        // --- ZONAPROP API SIMULATION ---
        logToFile(`Publishing property ${propertyId} to Zonaprop...`);
        logToFile(`Using username: ${creds.username}`);

        // Simulating artificial delay for the external API call
        await new Promise(resolve => setTimeout(resolve, 2500));

        const portalUrl = "https://www.zonaprop.com.ar/propiedades/clasificado-" + Math.random().toString(36).substr(2, 9) + ".html";

        // 5. Update status in DB using Admin client to guarantee persistence
        const { error: updateError } = await supabaseAdmin
            .from('properties')
            .update({
                zonaprop_status: 'published',
                zonaprop_url: portalUrl
            })
            .eq('id', propertyId);

        if (updateError) {
            logToFile(`Failed to update property status: ${JSON.stringify(updateError)}`);
        } else {
            logToFile(`Property status updated to PUBLISHED in DB for ID ${propertyId}`);
        }

        const responsePayload = {
            success: true,
            portal_url: portalUrl,
            message: "Published successfully"
        };

        logToFile(`Sending response: ${JSON.stringify(responsePayload)}`);

        return NextResponse.json(responsePayload);

    } catch (error: any) {
        logToFile(`Zonaprop Publishing Error: ${error?.message}`);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
