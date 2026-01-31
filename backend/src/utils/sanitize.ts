/**
 * Sanitizes service/category names by removing provider branding
 * This is now EXTREMELY permissive to ensure emojis and icons stay visible.
 */

export const sanitizeServiceName = (rawName: string, providerName: string, providerAliases: string[] = []): string => {
    if (!rawName) return '';

    let cleaned = rawName;

    // Common SMM provider brands to remove - only if they match exactly (case-insensitive)
    const commonBrands = [
        'MTP',
        'MoreThenPanel',
        'MoreThanPanel',
        'More Then Panel',
        'More Than Panel',
        'GlobalSMM',
        'Global SMM',
        'JustAnotherPanel',
        'JAP',
        'BestSMM',
        'TopSMM',
        'PerfectPanel',
        'SMMPanel'
    ];

    // Brand names to remove
    const brandNames = [providerName, ...providerAliases, ...commonBrands]
        .filter(b => b && b.length > 2); // Only strip brands longer than 2 chars to avoid hitting emojis/icons

    // Remove all brand variations (case-insensitive)
    brandNames.forEach(brand => {
        const escapedBrand = brand.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        // We add boundaries to avoid stripping letters inside other words, or inside emojis
        const regex = new RegExp(`\\b${escapedBrand}\\b`, 'gi');
        cleaned = cleaned.replace(regex, '');
    });

    // Remove extra whitespace but DO NOT touch symbols or special chars anymore
    cleaned = cleaned.replace(/\s+/g, ' ').trim();

    // If cleaning made it empty, return original
    return cleaned || rawName;
};

/**
 * Get provider aliases for common brand variations
 */
export const getProviderAliases = (providerName: string): string[] => {
    const aliases: string[] = [];

    // Add common variations
    aliases.push(providerName.replace(/\s+/g, '')); // Remove spaces
    aliases.push(providerName.toUpperCase());
    aliases.push(providerName.toLowerCase());

    return [...new Set(aliases)].filter(a => a.length > 2); // Only long aliases
};
