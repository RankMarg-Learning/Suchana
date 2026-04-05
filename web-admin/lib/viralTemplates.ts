/**
 * Utility for generating high-performance, viral social sharing messages
 * Optimized for WhatsApp and Telegram.
 */

interface ViralTemplateParams {
    title: string;
    shortTitle?: string;
    body: string;
    vacancies?: string | null;
    status: string;
    slug: string;
    category: string;
    lifecycleEvents?: any[];
}

export const generateFOMOContent = ({
    title,
    shortTitle,
    body,
    vacancies,
    status,
    slug,
    category,
    lifecycleEvents = []
}: ViralTemplateParams) => {
    const url = `https://examsuchana.in/exam/${slug}`;
    const b = (text: string) => `*${text}*`;
    
    const formatDate = (dateStr: string) => {
        try {
            return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
        } catch (e) { return 'TBA' }
    };

    let statusBadge = '';
    let contextMsg = '';
    let actionCTA = '';
    let dateLine = '';

    const regEvent = lifecycleEvents.find((e: any) => e.stage === 'REGISTRATION');
    const examEvent = lifecycleEvents.find((e: any) => e.stage === 'EXAM');

    switch(status) {
        case 'REGISTRATION_OPEN':
            statusBadge = '🔥 [REGISTRATION LIVE]';
            contextMsg = `Application for ${b(shortTitle || title)} is now open in ${b(body)}. Don't miss this opportunity!`;
            if (regEvent?.endsAt) {
                dateLine = `⏰ ${b('DEADLINE')}: ${formatDate(regEvent.endsAt)} ⏳`;
            }
            actionCTA = `Complete your registration today!`;
            break;
        case 'ADMIT_CARD_OUT':
            statusBadge = '✅ [ADMIT CARD OUT]';
            contextMsg = `Admit cards for ${b(shortTitle || title)} are ready. Check your center and exam session.`;
            if (examEvent?.startsAt) {
                dateLine = `📅 ${b('EXAM DATE')}: ${formatDate(examEvent.startsAt)}`;
            }
            actionCTA = `Download hall ticket now! ✍️`;
            break;
        case 'RESULT_DECLARED':
            statusBadge = '🏆 [RESULT DECLARED]';
            contextMsg = `Great news! The merit list for ${b(shortTitle || title)} has been published.`;
            actionCTA = `Check your results now! 🎊`;
            break;
        case 'ANSWER_KEY_OUT':
            statusBadge = '📝 [ANSWER KEY OUT]';
            contextMsg = `Provisional Answer Key for ${b(shortTitle || title)} is out. Verify your scores.`;
            actionCTA = `Calculate your rank!`;
            break;
        case 'EXAM_CITY_INTIMATION':
            statusBadge = '📍 [EXAM CITY OUT]';
            contextMsg = `Advance city intimation slip for ${b(shortTitle || title)} is now available.`;
            actionCTA = `Check your exam city and plan your travel!`;
            break;
        case 'NOTIFICATION':
        default:
            statusBadge = '📢 [NEW NOTIFICATION]';
            contextMsg = `Official recruitment alert released by ${b(body)} for ${b(shortTitle || title)}.`;
            // Simplified: No "Starts" line here anymore
            actionCTA = `Check full eligibility and details!`;
            break;
    }

    const vacancyInfo = vacancies && vacancies.length < 50 
        ? `💼 ${b('Vacancies')}: ${vacancies}`
        : `💼 ${b('Vacancies')}: Check full info on site`;

    const text = `🚨 ${b('ALERT')}: ${statusBadge} 🚨\n\n${contextMsg}\n\n${vacancyInfo}\n${dateLine ? dateLine + '\n' : ''}\n${actionCTA}\n\n👉 ${b('Check Full Details & Action Links')}:\n${url}\n\n🎯 ${b('Share with your study groups!')} 🎯`;
    
    return text;
};
