import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { 
    ExamCategory, 
    ExamLevel, 
    ExamStatus, 
    LifecycleStage, 
    QualificationLevel 
} from '../src/constants/enums';
import slugify from 'slugify';

const prisma = new PrismaClient();

async function main() {
    console.log('Cleaning up existing exams and events...');
    // Caution: This deletes ALL exams. If you only want to add, comment these lines.
    await prisma.lifecycleEvent.deleteMany({});
    await prisma.exam.deleteMany({});

    console.log('Seeding 20 exams...');

    const exams = [
        {
            title: 'SSC Combined Graduate Level (CGL) 2024',
            shortTitle: 'SSC CGL',
            conductingBody: 'Staff Selection Commission',
            category: ExamCategory.SSC,
            status: ExamStatus.NOTIFICATION,
            examLevel: ExamLevel.NATIONAL,
            description: 'Recruitment for various Group B and Group C posts in different Ministries/ Departments/ Organizations of the Government of India.',
            officialWebsite: 'https://ssc.nic.in',
            age: '18 - 32 years',
            qualificationCriteria: "Graduate Degree in any discipline",
            totalVacancies: "17727",
            stages: [
                { stage: LifecycleStage.NOTIFICATION, date: new Date('2024-06-24'), title: 'Notification Released' },
                { stage: LifecycleStage.REGISTRATION, date: new Date('2024-06-24'), title: 'Application Starts' },
                { stage: LifecycleStage.REGISTRATION, date: new Date('2024-07-24'), title: 'Application Ends' },
                { stage: LifecycleStage.EXAM, date: new Date('2024-09-01'), title: 'Tier I Exam Starts' }
            ]
        },
        {
            title: 'UPSC Civil Services Examination 2024',
            shortTitle: 'UPSC CSE',
            conductingBody: 'Union Public Service Commission',
            category: ExamCategory.UPSC,
            status: ExamStatus.REGISTRATION_OPEN,
            examLevel: ExamLevel.NATIONAL,
            description: 'Premier competitive examination in India conducted by UPSC for recruitment to various Civil Services of the Government of India, including IAS, IPS, and IFS.',
            officialWebsite: 'https://upsc.gov.in',
            age: '21 - 32 years',
            qualificationCriteria: "Graduate Degree in any discipline",
            totalVacancies: "1056",
            stages: [
                { stage: LifecycleStage.NOTIFICATION, date: new Date('2024-02-14'), title: 'Official Notification' },
                { stage: LifecycleStage.REGISTRATION, date: new Date('2024-02-14'), title: 'Registration Start' },
                { stage: LifecycleStage.REGISTRATION, date: new Date('2024-03-05'), title: 'Registration End' },
                { stage: LifecycleStage.EXAM, date: new Date('2024-05-26'), title: 'Prelims Exam' }
            ]
        },
        {
            title: 'SBI Probationary Officer (PO) 2024',
            shortTitle: 'SBI PO',
            conductingBody: 'State Bank of India',
            category: ExamCategory.BANKING_JOBS,
            status: ExamStatus.ADMIT_CARD_OUT,
            examLevel: ExamLevel.NATIONAL,
            description: 'Recruitment for the post of Probationary Officers in State Bank of India.',
            officialWebsite: 'https://sbi.co.in/careers',
            age: '21 - 30 years',
            qualificationCriteria: "Graduate Degree in any discipline",
            totalVacancies: "2000",
            stages: [
                { stage: LifecycleStage.NOTIFICATION, date: new Date('2024-09-05'), title: 'Recruitment Notification' },
                { stage: LifecycleStage.REGISTRATION, date: new Date('2024-09-07'), title: 'Online Form Starts' },
                { stage: LifecycleStage.ADMIT_CARD, date: new Date('2024-11-01'), title: 'Prelims Admit Card Out' },
                { stage: LifecycleStage.EXAM, date: new Date('2024-11-15'), title: 'Prelims Examination' }
            ]
        },
        {
            title: 'RRB Non-Technical Popular Categories (NTPC) 2024',
            shortTitle: 'RRB NTPC',
            conductingBody: 'Railway Recruitment Board',
            category: ExamCategory.RAILWAY_JOBS,
            status: ExamStatus.EXAM_ONGOING,
            examLevel: ExamLevel.NATIONAL,
            description: 'Railway recruitment for various posts like Station Master, Goods Guard, Commercial Apprentice, etc.',
            officialWebsite: 'https://indianrailways.gov.in',
            age: '18 - 33 years',
            qualificationCriteria: "12th Pass or equivalent",
            totalVacancies: "11558",
            stages: [
                { stage: LifecycleStage.REGISTRATION, date: new Date('2024-03-01'), title: 'Form Fillup Start' },
                { stage: LifecycleStage.ADMIT_CARD, date: new Date('2024-05-10'), title: 'CBT 1 Admit Card' },
                { stage: LifecycleStage.EXAM, date: new Date('2024-05-20'), title: 'Exam Commenced' },
                { stage: LifecycleStage.EXAM, date: new Date('2024-06-15'), title: 'Exam Concluding' }
            ]
        },
        {
            title: 'IBPS Clerk Recruitment 2024',
            shortTitle: 'IBPS Clerk',
            conductingBody: 'Institute of Banking Personnel Selection',
            category: ExamCategory.BANKING_JOBS,
            status: ExamStatus.RESULT_DECLARED,
            examLevel: ExamLevel.NATIONAL,
            description: 'CRP Clerical recruitment for public sector banks.',
            officialWebsite: 'https://ibps.in',
            age: '20 - 28 years',
            qualificationCriteria: "Graduate Degree in any discipline",
            totalVacancies: "6128",
            stages: [
                { stage: LifecycleStage.REGISTRATION, date: new Date('2024-07-01'), title: 'Apply Online' },
                { stage: LifecycleStage.EXAM, date: new Date('2024-08-20'), title: 'Mains Exam' },
                { stage: LifecycleStage.RESULT, date: new Date('2024-10-01'), title: 'Final Result' }
            ]
        },
        {
            title: 'IBPS PO CRP XIV',
            shortTitle: 'IBPS PO',
            conductingBody: 'Institute of Banking Personnel Selection',
            category: ExamCategory.BANKING_JOBS,
            status: ExamStatus.REGISTRATION_CLOSED,
            examLevel: ExamLevel.NATIONAL,
            description: 'Recruitment for Probationary Officers in Public Sector Banks.',
            officialWebsite: 'https://ibps.in',
            stages: [
                { stage: LifecycleStage.REGISTRATION, date: new Date('2024-08-01'), title: 'Window Opens' },
                { stage: LifecycleStage.REGISTRATION, date: new Date('2024-08-21'), title: 'Window Closes' },
                { stage: LifecycleStage.EXAM, date: new Date('2024-10-19'), title: 'Prelims Date' }
            ]
        },
        {
            title: 'UPPSC Combined State Services 2024',
            shortTitle: 'UPPCS',
            conductingBody: 'Uttar Pradesh Public Service Commission',
            category: ExamCategory.STATE_PSC,
            status: ExamStatus.NOTIFICATION,
            examLevel: ExamLevel.STATE,
            state: 'Uttar Pradesh',
            description: 'Civil services exam for the state of Uttar Pradesh.',
            officialWebsite: 'https://uppsc.up.nic.in',
            stages: [
                { stage: LifecycleStage.NOTIFICATION, date: new Date('2024-01-01'), title: 'Advt No. A-1/E-1/2024' },
                { stage: LifecycleStage.EXAM, date: new Date('2024-10-27'), title: 'Prelims New Date' }
            ]
        },
        {
            title: 'WBPSC WBCS (Exe) 2023-24',
            shortTitle: 'WBCS',
            conductingBody: 'West Bengal Public Service Commission',
            category: ExamCategory.STATE_PSC,
            status: ExamStatus.RESULT_DECLARED,
            examLevel: ExamLevel.STATE,
            state: 'West Bengal',
            stages: [
                { stage: LifecycleStage.EXAM, date: new Date('2023-12-16'), title: 'Prelims Exam' },
                { stage: LifecycleStage.RESULT, date: new Date('2024-03-10'), title: 'Prelims Result Out' }
            ]
        },
        {
            title: 'SSC Junior Engineer (JE) 2024',
            shortTitle: 'SSC JE',
            conductingBody: 'Staff Selection Commission',
            category: ExamCategory.ENGINEERING_ENTRANCE,
            status: ExamStatus.REGISTRATION_OPEN,
            examLevel: ExamLevel.NATIONAL,
            stages: [
                { stage: LifecycleStage.REGISTRATION, date: new Date('2024-03-28'), title: 'Application Link Active' },
                { stage: LifecycleStage.REGISTRATION, date: new Date('2024-04-18'), title: 'Last Date to Apply' }
            ]
        },
        {
            title: 'Bihar Police Constable Recruitment 2024',
            shortTitle: 'Bihar Police',
            conductingBody: 'CSBC Bihar',
            category: ExamCategory.POLICE_JOBS,
            status: ExamStatus.EXAM_ONGOING,
            examLevel: ExamLevel.STATE,
            state: 'Bihar',
            stages: [
                { stage: LifecycleStage.EXAM, date: new Date('2024-08-07'), title: 'Written Exam Starts' },
                { stage: LifecycleStage.EXAM, date: new Date('2024-08-28'), title: 'Written Exam Ends' }
            ]
        },
        {
            title: 'CTET July 2024',
            shortTitle: 'CTET',
            conductingBody: 'CBSE',
            category: ExamCategory.TEACHING_ELIGIBILITY,
            status: ExamStatus.RESULT_DECLARED,
            examLevel: ExamLevel.NATIONAL,
            stages: [
                { stage: LifecycleStage.EXAM, date: new Date('2024-07-07'), title: 'Exam Day' },
                { stage: LifecycleStage.RESULT, date: new Date('2024-07-31'), title: 'Score Card Released' }
            ]
        },
        {
            title: 'NDA & NA (II) 2024',
            shortTitle: 'NDA II',
            conductingBody: 'Union Public Service Commission',
            category: ExamCategory.DEFENCE_JOBS,
            status: ExamStatus.ADMIT_CARD_OUT,
            examLevel: ExamLevel.NATIONAL,
            stages: [
                { stage: LifecycleStage.REGISTRATION, date: new Date('2024-06-04'), title: 'Registration Over' },
                { stage: LifecycleStage.ADMIT_CARD, date: new Date('2024-08-23'), title: 'e-Admit Card' },
                { stage: LifecycleStage.EXAM, date: new Date('2024-09-01'), title: 'Exam Date' }
            ]
        },
        {
            title: 'JEECUP Polytechnic Entrance 2024',
            shortTitle: 'JEECUP',
            conductingBody: 'UP Joint Entrance Examination Council',
            category: ExamCategory.OTHER,
            status: ExamStatus.NOTIFICATION,
            examLevel: ExamLevel.STATE,
            state: 'Uttar Pradesh',
            stages: [
                { stage: LifecycleStage.NOTIFICATION, date: new Date('2024-01-20'), title: 'Official Info' },
                { stage: LifecycleStage.REGISTRATION, date: new Date('2024-02-01'), title: 'Portal Open' }
            ]
        },
        {
            title: 'SBI Junior Associates (Clerk) 2024',
            shortTitle: 'SBI Clerk',
            conductingBody: 'SBI',
            category: ExamCategory.BANKING_JOBS,
            status: ExamStatus.NOTIFICATION,
            examLevel: ExamLevel.NATIONAL,
            stages: [
                { stage: LifecycleStage.NOTIFICATION, date: new Date('2024-11-15'), title: 'Expected Notification' }
            ]
        },
        {
            title: 'Delhi Police Constable (Exec) Result',
            shortTitle: 'DP Constable',
            conductingBody: 'SSC',
            category: ExamCategory.POLICE_JOBS,
            status: ExamStatus.RESULT_DECLARED,
            examLevel: ExamLevel.DISTRICT,
            state: 'Delhi',
            stages: [
                { stage: LifecycleStage.EXAM, date: new Date('2023-11-14'), title: 'Computer Based Exam' },
                { stage: LifecycleStage.RESULT, date: new Date('2024-01-24'), title: 'Final Selection List' }
            ]
        },
        {
            title: 'Rajasthan Patwari Recruitment 2024',
            shortTitle: 'Raj Patwari',
            conductingBody: 'RSMSSB',
            category: ExamCategory.GOVERNMENT_JOBS,
            status: ExamStatus.NOTIFICATION,
            examLevel: ExamLevel.STATE,
            state: 'Rajasthan',
            stages: [
                { stage: LifecycleStage.NOTIFICATION, date: new Date('2024-12-10'), title: 'Draft Notification' }
            ]
        },
        {
            title: 'CAT 2024 MBA Entrance',
            shortTitle: 'CAT',
            conductingBody: 'IIM Calcutta',
            category: ExamCategory.MBA_ENTRANCE,
            status: ExamStatus.REGISTRATION_OPEN,
            examLevel: ExamLevel.NATIONAL,
            stages: [
                { stage: LifecycleStage.REGISTRATION, date: new Date('2024-08-01'), title: 'Registration Opens' },
                { stage: LifecycleStage.REGISTRATION, date: new Date('2024-09-13'), title: 'Registration Closes' },
                { stage: LifecycleStage.EXAM, date: new Date('2024-11-24'), title: 'CAT Exam Day' }
            ]
        },
        {
            title: 'MPPSC State Service 2024',
            shortTitle: 'MPPSC',
            conductingBody: 'MPPSC',
            category: ExamCategory.STATE_PSC,
            status: ExamStatus.ADMIT_CARD_OUT,
            examLevel: ExamLevel.STATE,
            state: 'Madhya Pradesh',
            stages: [
                { stage: LifecycleStage.ADMIT_CARD, date: new Date('2024-06-15'), title: 'Prelims Hall Ticket' },
                { stage: LifecycleStage.EXAM, date: new Date('2024-06-23'), title: 'Prelims Exam Date' }
            ]
        },
        {
            title: 'SSC Selection Post Phase XII',
            shortTitle: 'Selection Post',
            conductingBody: 'SSC',
            category: ExamCategory.SSC,
            status: ExamStatus.REGISTRATION_CLOSED,
            examLevel: ExamLevel.NATIONAL,
            stages: [
                { stage: LifecycleStage.REGISTRATION, date: new Date('2024-02-26'), title: 'Opening' },
                { stage: LifecycleStage.REGISTRATION, date: new Date('2024-03-26'), title: 'Closing' }
            ]
        },
        {
            title: 'GATE 2025',
            shortTitle: 'GATE',
            conductingBody: 'IIT Roorkee',
            category: ExamCategory.ENGINEERING_ENTRANCE,
            status: ExamStatus.NOTIFICATION,
            examLevel: ExamLevel.NATIONAL,
            stages: [
                { stage: LifecycleStage.REGISTRATION, date: new Date('2024-08-24'), title: 'Registration Starts' },
                { stage: LifecycleStage.EXAM, date: new Date('2025-02-01'), title: 'Exam Begins' }
            ]
        }
    ];

    for (const examData of exams) {
        const { stages, ...rest } = examData;
        
        const slug = slugify(rest.title, { lower: true, strict: true });

        const createdExam = await prisma.exam.create({
            data: {
                ...rest,
                slug,
                createdBy: 'admin',
                isPublished: true,
                publishedAt: new Date(),
                lifecycleEvents: {
                    create: stages.map((s, index) => ({
                        stage: s.stage,
                        title: s.title,
                        startsAt: s.date,
                        stageOrder: (index + 1) * 10,
                        createdBy: 'admin'
                    }))
                }
            }
        });

        console.log(`Created exam: ${createdExam.title} (${createdExam.id})`);
    }

    console.log('Seeding completed successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
