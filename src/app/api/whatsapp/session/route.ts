import { NextResponse } from 'next/server';
import { waha } from '@/lib/whatsapp/waha';
import { Logger } from '@/lib/logger';

export async function GET() {
    try {
        const state = await waha.getStatus('default');
        Logger.info('Session state check:', state);

        // Map WAHA status/state to a consistent status field
        let currentStatus = 'DISCONNECTED';

        // Check for various "connected" indicators from WAHA
        if (state.state === 'CONNECTED' || state.status === 'RUNNING' || state.status === 'WORKING') {
            // Further verify if we have identity (me)
            currentStatus = state.me ? 'CONNECTED' : 'STARTING';
        } else if (state.state === 'SCAN_QR' || state.status === 'STARTING') {
            currentStatus = 'STARTING';
        } else if (state.status === 'FAILED') {
            currentStatus = 'FAILED';
        }


        // If not connected, try to get QR
        let qr = null;
        if (currentStatus !== 'CONNECTED') {

            const qrData = await waha.getQr('default');
            qr = qrData?.qr;
            if (qr) {
                Logger.info('QR code generated successfully');
            } else {
                Logger.warn('No QR code returned from WAHA');
            }
        }

        return NextResponse.json({
            status: currentStatus,
            qr: qr,
            session: 'default'
        });
    } catch (error: any) {
        Logger.error('Error in GET /api/whatsapp/session:', { error: error.message });
        // If session doesn't exist, it might throw 404
        return NextResponse.json({ status: 'NOT_FOUND', error: error.message }, { status: 200 });
    }
}

export async function POST() {
    try {
        Logger.info('Manual session start requested');
        const result = await waha.startSession('default');
        return NextResponse.json(result);
    } catch (error: any) {
        Logger.error('Error in POST /api/whatsapp/session:', { error: error.message });
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE() {
    try {
        Logger.info('Manual session logout requested');
        const result = await waha.logout('default');
        return NextResponse.json(result);
    } catch (error: any) {
        Logger.error('Error in DELETE /api/whatsapp/session:', { error: error.message });
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

