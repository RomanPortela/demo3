import { NextResponse } from 'next/server';

export const revalidate = 300; // Cache for 5 minutes

export async function GET() {
    try {
        const [blueRes, officialRes] = await Promise.all([
            fetch('https://dolarapi.com/v1/dolares/blue', { next: { revalidate: 300 } }),
            fetch('https://dolarapi.com/v1/dolares/oficial', { next: { revalidate: 300 } })
        ]);

        if (!blueRes.ok || !officialRes.ok) {
            throw new Error('Failed to fetch from external API');
        }

        const blueData = await blueRes.json();
        const officialData = await officialRes.json();

        return NextResponse.json({
            blue: {
                buy: blueData.compra,
                sell: blueData.venta
            },
            official: {
                buy: officialData.compra,
                sell: officialData.venta
            },
            timestamp: blueData.fechaActualizacion
        });

    } catch (error) {
        console.error('Error fetching dollar rates:', error);
        return NextResponse.json({ error: 'Failed to fetch rates' }, { status: 500 });
    }
}
