// Mock data for Admin Dashboard
// Ready for future backend integration (Firebase/Supabase)

export interface Event {
  id: string
  name: string
  date: string
  category: "Workshop" | "Hackathon" | "Guest Lecture"
  status: "Upcoming" | "Completed"
  description: string
  posterUrl?: string
  createdAt: string
}

export interface Project {
  id: string
  name: string
  description: string
  techStack: string[]
  teamSize: number
  githubLink: string
  category: "Web" | "Mobile" | "Internal" | "Community"
  createdAt: string
}

export interface TeamMember {
  id: string
  name: string
  role: string
  roleCategory: "Faculty" | "Lead" | "Domain Lead" | "Core Team"
  profileImage?: string
  linkedinLink?: string
  githubLink?: string
  createdAt: string
}

export interface Announcement {
  id: string
  title: string
  content: string
  isVisible: boolean
  createdAt: string
}

export interface ContactMessage {
  id: string
  name: string
  email: string
  message: string
  date: string
  isRead: boolean
}

export interface Settings {
  clubEmail: string
  instagramLink: string
  linkedinLink: string
  githubLink: string
  twitterLink: string
  darkMode: boolean
}

// Initial mock data
export const initialEvents: Event[] = [
  {
    id: "1",
    name: "Flutter Workshop 2024",
    date: "2024-02-15",
    category: "Workshop",
    status: "Completed",
    description: "Learn the basics of Flutter and build your first mobile app.",
    createdAt: "2024-01-10",
  },
  {
    id: "2",
    name: "HackArena 2024",
    date: "2024-03-20",
    category: "Hackathon",
    status: "Upcoming",
    description: "24-hour hackathon for building innovative solutions.",
    createdAt: "2024-02-01",
  },
  {
    id: "3",
    name: "Industry Connect: Tech Talk",
    date: "2024-04-05",
    category: "Guest Lecture",
    status: "Upcoming",
    description: "Guest lecture by senior engineers from top tech companies.",
    createdAt: "2024-02-15",
  },
  {
    id: "4",
    name: "React Fundamentals",
    date: "2024-01-25",
    category: "Workshop",
    status: "Completed",
    description: "Deep dive into React hooks and component patterns.",
    createdAt: "2024-01-05",
  },
]

export const initialProjects: Project[] = [
  {
    id: "1",
    name: "Campus Connect",
    description: "A mobile app connecting students with campus resources and events.",
    techStack: ["React Native", "Firebase", "Node.js"],
    teamSize: 5,
    githubLink: "https://github.com/adclub/campus-connect",
    category: "Mobile",
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    name: "Club Website",
    description: "Official website for Arena App Development Club.",
    techStack: ["Next.js", "Tailwind CSS", "TypeScript"],
    teamSize: 4,
    githubLink: "https://github.com/adclub/website",
    category: "Web",
    createdAt: "2024-02-01",
  },
  {
    id: "3",
    name: "Event Manager",
    description: "Internal tool for managing club events and registrations.",
    techStack: ["React", "Supabase", "Tailwind CSS"],
    teamSize: 3,
    githubLink: "https://github.com/adclub/event-manager",
    category: "Internal",
    createdAt: "2024-01-20",
  },
]

export const initialTeamMembers: TeamMember[] = [
  {
    id: "1",
    name: "Dr. Priya Sharma",
    role: "Faculty Advisor",
    roleCategory: "Faculty",
    linkedinLink: "https://linkedin.com/in/priyasharma",
    createdAt: "2023-08-01",
  },
  {
    id: "2",
    name: "Arjun Patel",
    role: "Club President",
    roleCategory: "Lead",
    linkedinLink: "https://linkedin.com/in/arjunpatel",
    githubLink: "https://github.com/arjunpatel",
    createdAt: "2023-08-15",
  },
  {
    id: "3",
    name: "Sneha Reddy",
    role: "Mobile Development Lead",
    roleCategory: "Domain Lead",
    linkedinLink: "https://linkedin.com/in/snehareddy",
    githubLink: "https://github.com/snehareddy",
    createdAt: "2023-09-01",
  },
  {
    id: "4",
    name: "Vikram Singh",
    role: "Web Development Lead",
    roleCategory: "Domain Lead",
    linkedinLink: "https://linkedin.com/in/vikramsingh",
    githubLink: "https://github.com/vikramsingh",
    createdAt: "2023-09-01",
  },
  {
    id: "5",
    name: "Ananya Gupta",
    role: "UI/UX Lead",
    roleCategory: "Domain Lead",
    linkedinLink: "https://linkedin.com/in/ananyagupta",
    createdAt: "2023-09-01",
  },
  {
    id: "6",
    name: "Rahul Kumar",
    role: "Core Team Member",
    roleCategory: "Core Team",
    githubLink: "https://github.com/rahulkumar",
    createdAt: "2023-10-01",
  },
]

export const initialAnnouncements: Announcement[] = [
  {
    id: "1",
    title: "HackArena 2024 Registrations Open!",
    content: "Register now for our flagship hackathon. Limited seats available!",
    isVisible: true,
    createdAt: "2024-02-01",
  },
  {
    id: "2",
    title: "New Workshop Series",
    content: "Join our weekly workshop series on modern web development.",
    isVisible: false,
    createdAt: "2024-01-20",
  },
]

export const initialMessages: ContactMessage[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    message: "I would like to know more about joining the club. What are the requirements?",
    date: "2024-02-10",
    isRead: true,
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane@example.com",
    message: "Can you provide more details about the upcoming hackathon?",
    date: "2024-02-12",
    isRead: false,
  },
  {
    id: "3",
    name: "Mike Johnson",
    email: "mike@example.com",
    message: "Interested in collaborating on a project. Please get back to me.",
    date: "2024-02-14",
    isRead: false,
  },
]

export const initialSettings: Settings = {
  clubEmail: "adclub@college.edu",
  instagramLink: "https://instagram.com/adclub",
  linkedinLink: "https://linkedin.com/company/adclub",
  githubLink: "https://github.com/adclub",
  twitterLink: "https://twitter.com/adclub",
  darkMode: false,
}
