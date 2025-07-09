import { TeamData, TeamMember } from '@/types/team';
import teamData from '@/data/team.json';

/**
 * Get all team members
 */
export function getAllTeamMembers(): TeamMember[] {
  return (teamData as TeamData).team;
}

/**
 * Get a specific team member by ID
 */
export function getTeamMemberById(id: string): TeamMember | undefined {
  return (teamData as TeamData).team.find(member => member.id === id);
}

/**
 * Get all team members who are blog authors
 */
export function getBlogAuthors(): TeamMember[] {
  return (teamData as TeamData).team.filter(member => member.isBlogAuthor);
}

/**
 * Get team member by name (for blog author matching)
 */
export function getTeamMemberByName(name: string): TeamMember | undefined {
  return (teamData as TeamData).team.find(
    member => member.name.toLowerCase() === name.toLowerCase()
  );
}

/**
 * Format body stats for display
 */
export function formatBodyStats(member: TeamMember): {
  bodyFat: string;
  height: string;
} {
  return {
    bodyFat: `${member.bodyStats.bodyFat}%`,
    height: member.bodyStats.height
  };
}