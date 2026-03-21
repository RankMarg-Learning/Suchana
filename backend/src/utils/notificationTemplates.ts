import { LifecycleStage } from '../constants/enums';

export interface NotificationContent {
    title: string;
    body: string;
}

export class NotificationTemplates {
    static getEventTemplate(
        examTitle: string,
        eventTitle: string,
        stage: LifecycleStage,
        startsAt?: Date
    ): NotificationContent {
        const dateStr = startsAt ? new Date(startsAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '';

        // Prioritize specific event title for clarity
        const lowerTitle = eventTitle.toLowerCase();
        
        switch (stage) {
            case LifecycleStage.REGISTRATION:
                if (lowerTitle.includes('start') || lowerTitle.includes('open')) {
                    return {
                        title: `📝 Apply Now: ${examTitle}`,
                        body: `Registration for ${examTitle} has started${dateStr ? ` on ${dateStr}` : ''}. Don't miss the deadline!`
                    };
                }
                if (lowerTitle.includes('close') || lowerTitle.includes('end') || lowerTitle.includes('last')) {
                    return {
                        title: `⏳ Last Call: ${examTitle}`,
                        body: `Registration for ${examTitle} is closing soon${dateStr ? ` on ${dateStr}` : ''}. Apply now!`
                    };
                }
                break;

            case LifecycleStage.ADMIT_CARD:
                return {
                    title: `🎟️ Admit Card Out: ${examTitle}`,
                    body: `Download your admit card for ${examTitle}. The exam is approaching!`
                };

            case LifecycleStage.EXAM:
                return {
                    title: `✍️ Exam Update: ${examTitle}`,
                    body: `${eventTitle} scheduled for ${dateStr || 'soon'}. Good luck!`
                };

            case LifecycleStage.RESULT:
                return {
                    title: `🎉 Result Declared: ${examTitle}`,
                    body: `${examTitle} results are now available. Check your status now!`
                };

            case LifecycleStage.ANSWER_KEY:
                return {
                    title: `🔑 Answer Key: ${examTitle}`,
                    body: `The official answer key for ${examTitle} has been released. Challenge if needed.`
                };
        }

        // Default template
        return {
            title: `📢 ${examTitle} Update`,
            body: `${eventTitle} - A new update is available for ${examTitle}. Tap to view.`
        };
    }

    static getNewExamTemplate(examTitle: string, category: string, vacancies?: number): NotificationContent {
        return {
            title: `🆕 New Exam: ${examTitle}`,
            body: `A new exam has been added: ${examTitle}${vacancies ? ` with ${vacancies} vacancies` : ''}. Check eligibility and apply!`
        };
    }

    static getLatestStageTemplate(examTitle: string, stage: string): NotificationContent {
        return {
            title: `🔄 Status Update: ${examTitle}`,
            body: `${examTitle} has moved to the ${stage.replace(/_/g, ' ')} stage. View the updated timeline.`
        };
    }
}
