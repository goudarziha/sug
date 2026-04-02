import type { ISignal, TSegment } from "../types/index.js";

export const getSegment = (signal: ISignal): string | null => {
    const { utm_medium, utm_campaign, landing_path, referrer_domain } = signal;
    if (utm_medium !== 'cpc' && utm_medium !== 'ppc') return null

    const isPaidSportsArr: Array<string> = ["team", "sport"];
    if (isPaidSportsArr.some((word: string) => utm_campaign?.toLowerCase().includes(word))) return 'paid-sports'

    const isSchoolArr: Array<string> = ["school", "teacher", "education"];
    if (isSchoolArr.some((word: string) => utm_campaign?.toLowerCase().includes(word))) return 'paid-education'

    if (referrer_domain?.toLowerCase().includes('linkedin')) return 'social-linkedin'
    if (referrer_domain?.toLowerCase().includes('facebook')) return 'social-facebook'

    if (landing_path?.toLowerCase().includes('sports')) return 'sports-vertical'
    if (landing_path?.toLowerCase().includes('education')) return 'education-vertical'

    return 'direct-traffic'
}

export const getPersonalizationForVisitor = async (segment: TSegment | null) => {
    const personalizationItems = {
        'paid-sports': {
            hero: {
                title: 'The easiest way to organize your next sports league',
                subTitle: 'Create your own sports league in minutes',
                ctaText: 'Get Started now for free!',
                ctaUrl: '/signup?ref=sports-paid',
                image: 'https://via.placeholder.com/150',
            },
            theme: 'sports-theme',
            useCases: ['schedules', 'tournaments', 'coordinating teams', 'player management', 'communication'],
            socialProof: ['100+ sports leagues created', '1000+ teams registered', '10000+ players managed'],
        },
        'paid-education': {
            hero: {
                title: 'Sign-up sheets for schools and PTAs',
                subTitle: 'Free tools trusted millions of parents and teachers',
                ctaText: 'Get Started now for free!',
                ctaUrl: '/signup?ref=education-paid',
                image: 'https://via.placeholder.com/150',
            },
            theme: 'education-theme',
            useCases: ['sign-up sheets', 'parent-teacher conferences', 'class rosters', 'student attendance'],
            socialProof: ['100+ schools and PTAs created', '1000+ teachers and parents registered', '10000+ students managed'],
        },
        'social-facebook': {
            hero: {
                title: 'Join the millions of people using our free tools',
                subTitle: 'Free tools trusted millions of parents and teachers',
                ctaText: 'Get Started now for free!',
                ctaUrl: '/signup?ref=facebook-paid',
                image: 'https://via.placeholder.com/150',
            },
            theme: 'social-theme',
            useCases: ['group events', 'team activities', 'fundraising', 'community engagement'],
            socialProof: ['100+ social media posts created', '1000+ followers gained', '10000+ interactions'],
        },
        'sports-vertical': {
            hero: {
                title: 'The easiest way to organize your next sports league',
                subTitle: 'Create your own sports league in minutes',
                ctaText: 'Get Started now for free!',
                ctaUrl: '/signup?ref=sports-paid',
                image: 'https://via.placeholder.com/150',
            },
        },
        'education-vertical': {
            hero: {
                title: 'The easiest way to organize your next education program',
                subTitle: 'Create your own education program in minutes',
                ctaText: 'Get Started now for free!',
                ctaUrl: '/signup?ref=education-paid',
                image: 'https://via.placeholder.com/150',
            },
            theme: 'education-theme',
            useCases: ['sign-up sheets', 'parent-teacher conferences', 'class rosters', 'student attendance'],
            socialProof: ['100+ schools and PTAs created', '1000+ teachers and parents registered', '10000+ students managed'],
        },
        'default': {
            hero: {
                title: 'Organize anything fast. Sign up anyone',
                subTitle: 'Free sign up sheets for schools, sports leagues, and more',
                ctaText: 'Get Started now for free!',
                ctaUrl: '/signup',
                image: 'https://via.placeholder.com/150',
            },
            theme: 'default-theme',
            useCases: ['volunteering', 'event planning', 'fundraising', 'community engagement'],
            socialProof: ['Trusted by millions of users worldwide'],
        },
    }
    if (!segment) return personalizationItems['default'];
    return personalizationItems[segment as keyof typeof personalizationItems];
}