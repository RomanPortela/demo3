import { Property } from "@/types";

export function mapPropertyToMeLiItem(property: Property) {
    // Basic mapping for Real Estate (Inmuebles)
    // Note: Category ID depends on property type (Casa, Departamento, etc.)
    // We need to fetch category prediction or hardcode common ones for MVP.
    // MLA1466: Houses, MLA1472: Apartments

    let categoryId = 'MLA1466'; // Default Casa
    if (property.property_type?.toLowerCase().includes('departamento')) {
        categoryId = 'MLA1472';
    } else if (property.property_type?.toLowerCase().includes('terreno') || property.property_type?.toLowerCase().includes('lote')) {
        categoryId = 'MLA1491';
    } else if (property.property_type?.toLowerCase().includes('local')) {
        categoryId = 'MLA1493';
    } else if (property.property_type?.toLowerCase().includes('oficina')) {
        categoryId = 'MLA1494';
    }

    const title = `${property.property_type} en ${property.operation_type} - ${property.address || property.zone}`;
    const price = property.price || 0;
    const currency = property.currency || 'USD';

    const attributes = [
        { id: 'BEDROOMS', value_name: property.bedrooms?.toString() || '0' },
        { id: 'FULL_BATHROOMS', value_name: property.bathrooms?.toString() || '1' },
        { id: 'TOTAL_AREA', value_name: `${property.m2_total || 0} m²` },
        { id: 'COVERED_AREA', value_name: `${property.m2_built || 0} m²` },
    ];

    // Add more attributes if available
    if (property.environments) attributes.push({ id: 'ROOMS', value_name: property.environments.toString() });
    if (property.parkings) attributes.push({ id: 'PARKING_LOTS', value_name: property.parkings.toString() });

    const pictures = property.multimedia
        ?.filter(m => m.type === 'image')
        .map(m => ({ source: m.url }))
        || [];

    // Validations
    if (pictures.length === 0) {
        throw new Error('At least one image is required for Mercado Libre');
    }

    return {
        title: title.substring(0, 60), // Max 60 chars
        category_id: categoryId,
        price: price,
        currency_id: currency,
        available_quantity: 1,
        buying_mode: 'classified',
        listing_type_id: 'gold_premium', // Or 'gold', 'silver'. Should probably be configurable.
        condition: 'not_specified',
        pictures: pictures,
        attributes: attributes,
        description: {
            plain_text: property.internal_description || property.agent_observations || "Descripción no disponible"
        },
        location: {
            // This is tricky without geocoding or specific MeLi location IDs. 
            // Ideally we use the address to find a location match or send raw address if allowed.
            // For MVP, we might need to send minimal location info or rely on ZIP.
            address_line: property.address,
            zip_code: "1000", // HARDCODED for MVP if unknown
            city: { name: property.city || "Buenos Aires" },
            state: { id: "AR-C", name: "Capital Federal" }, // Example hardcoded
            country: { id: "AR", name: "Argentina" }
        },
        contact: {
            // Contact info is usually usually taken from the user account settings
        }
    };
}
