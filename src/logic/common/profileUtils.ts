import { User } from "../../infrastructure/generated/api";

/**
 * Get the first letter of user's display name parts and combine the first two parts (for example haim kasnter to HK :)
 * @param profile The profile to get text for
 * @returns The extracted text for avatar
 */
export function extractProfileAvatarText(profile?: User): string {
	// Trim the name, split by space (if empty, generate two dashes), for each word take the first, and make it capital, then take 
	// the first two works and combine them to one string. thats it :)
	return (profile?.displayName?.trim().split(' ') || ['-', '-']).map(p => p[0]?.toUpperCase()).slice(0, 2).join('');
}
