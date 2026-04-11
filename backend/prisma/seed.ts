import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const hash = await bcrypt.hash('password123', 12)

  const user = await prisma.user.upsert({
    where: { email: 'demo@medlearn.com' },
    update: {},
    create: {
      email: 'demo@medlearn.com',
      passwordHash: hash,
      name: 'Dr. Demo User',
      headline: 'Researcher at MedLearn',
      role: 'researcher',
      institution: 'MedLearn Institute',
      interests: ['oncology', 'machine learning'],
      skills: ['Python', 'R', 'Clinical Trials'],
    },
  })

  await prisma.user.upsert({
    where: { email: 'admin@medlearn.com' },
    update: { role: 'admin' },
    create: {
      email: 'admin@medlearn.com',
      passwordHash: hash,
      name: 'Admin User',
      headline: 'Platform admin',
      role: 'admin',
      institution: 'MedLearn',
      interests: [],
      skills: [],
    },
  })

  const paper = await prisma.paper.upsert({
    where: { id: 'seed-paper-001' },
    update: {},
    create: {
      id: 'seed-paper-001',
      title: 'Deep Learning in Medical Imaging: A Comprehensive Review',
      authors: ['Smith J', 'Patel R', 'Chen W'],
      abstract:
        'This review covers recent advances in deep learning applied to medical imaging, including CNN architectures for radiology, pathology slide analysis, and ophthalmology screening. We analyse 200+ studies published between 2019 and 2024.',
      year: 2024,
      journal: 'Nature Medicine',
      source: 'manual',
      doi: '10.1038/s41591-024-example',
      tags: ['deep-learning', 'medical-imaging', 'CNN', 'radiology'],
      postedBy: user.id,
    },
  })

  await prisma.post.createMany({
    skipDuplicates: true,
    data: [
      {
        id: 'seed-post-001',
        type: 'paper',
        authorId: user.id,
        paperId: paper.id,
        content:
          'Fascinating new review on deep learning in medical imaging. The section on CNN architectures for radiology is particularly relevant to anyone working on diagnostic AI.',
        tags: ['deep-learning', 'medical-imaging', 'radiology'],
        likeCount: 12,
        commentCount: 3,
      },
      {
        id: 'seed-post-002',
        type: 'insight',
        authorId: user.id,
        content:
          'Key insight from our lab: transfer learning from ImageNet to medical imaging consistently outperforms training from scratch, even with domain shift. Sample size matters less than architecture choice in low-data regimes.',
        tags: ['transfer-learning', 'medical-imaging', 'insight'],
        likeCount: 8,
        commentCount: 1,
      },
      {
        id: 'seed-post-003',
        type: 'question',
        authorId: user.id,
        content:
          'Has anyone benchmarked Vision Transformers against ResNet-50 on chest X-ray classification with fewer than 10,000 training samples? Looking for real-world comparisons, not just benchmark datasets.',
        tags: ['vision-transformer', 'chest-xray', 'question'],
        likeCount: 5,
        commentCount: 2,
      },
    ],
  })

  const exp = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

  const simplifyStudent = {
    plain_summary:
      'This paper reviews how artificial intelligence — especially deep learning — helps doctors read medical images like X-rays, MRI scans, and microscope slides. The authors looked at more than 200 studies and found that AI can spot diseases in images about as well as experienced doctors, and sometimes better. A key idea is that models trained on everyday photos can be adapted to medical images, which saves time and data.',
    key_findings: [
      'AI matched or exceeded radiologist performance on chest X-ray diagnosis in many reviewed studies',
      'Transfer learning from non-medical image datasets reduced training data requirements substantially',
      'Pathology slide analysis showed strong accuracy gains when using deep learning',
      'Models trained on smaller medical image sets still worked well when using transfer learning',
    ],
    methodology_type: 'Systematic Review',
    methodology_detail: 'Narrative and quantitative synthesis of 200+ peer-reviewed studies (2019–2024).',
    limitations: ['Heterogeneity across datasets', 'Limited prospective real-world validation in some studies'],
    study_population: 'Studies spanning radiology, pathology, and ophthalmology cohorts worldwide.',
  }

  const simplifyResearcher = {
    plain_summary:
      'Systematic review of 200+ deep learning studies in medical imaging (2019–2024). Primary contribution is a unified view of CNN architectures across radiology, digital pathology, and ophthalmology. Meta-analysis suggests ImageNet-pretrained models outperform random initialization in low-data regimes (n<10k), with diminishing returns as dataset size grows.',
    key_findings: [
      'ResNet and EfficientNet variants dominate radiology tasks in reviewed papers',
      'Vision Transformers become competitive primarily above ~50k training samples',
      'Inter-study AUC variance is partly explained by dataset curation, not only architecture',
      'Federated learning studies report modest accuracy trade-offs versus centralized training',
    ],
    methodology_type: 'Systematic Review',
    methodology_detail: 'Structured literature review with quantitative synthesis where reported.',
    limitations: ['Publication bias', 'Incomplete reporting of external validation'],
    study_population: 'Aggregated evidence from heterogeneous clinical and preclinical imaging datasets.',
  }

  const projectIdeas = [
    {
      difficulty: 'beginner',
      estimated_weeks: 3,
      project_title: 'Skin Lesion Classifier with Explainability',
      problem_statement:
        'Build a CNN that classifies benign vs malignant skin lesions and shows Grad-CAM heatmaps for clinical trust.',
      approach: 'Fine-tune a small CNN on ISIC-style images; add Grad-CAM visualization in a Streamlit UI.',
      tech_stack: ['Python', 'PyTorch', 'torchvision', 'Streamlit'],
      dataset_name: 'ISIC archive (public dermoscopy images)',
      dataset_url: 'https://www.isic-archive.com',
    },
    {
      difficulty: 'intermediate',
      estimated_weeks: 6,
      project_title: 'Federated Chest X-Ray Baseline',
      problem_statement:
        'Simulate federated training for pneumonia detection without centralising patient data.',
      approach: 'Partition NIH ChestX-ray14 into virtual sites; train with a federated learning framework.',
      tech_stack: ['Python', 'Flower', 'PyTorch'],
      dataset_name: 'NIH ChestX-ray14',
      dataset_url: 'https://nihcc.app.box.com/v/ChestXray-NIHCC',
    },
    {
      difficulty: 'advanced',
      estimated_weeks: 10,
      project_title: 'DR Screening on Mobile',
      problem_statement:
        'Train an EfficientNet on fundus images and deploy a lightweight TFLite model in a simple mobile UI.',
      approach: 'Train, quantise to TFLite, wrap in a minimal React Native or web camera flow.',
      tech_stack: ['Python', 'TensorFlow', 'TFLite', 'React Native'],
      dataset_name: 'Kaggle Diabetic Retinopathy',
      dataset_url: 'https://www.kaggle.com/c/diabetic-retinopathy-detection',
    },
  ]

  const conceptPath = {
    concepts: [
      {
        concept_name: 'Neural Networks Fundamentals',
        why_needed: 'Foundation for understanding how deep models learn from images.',
        resource_type: 'video' as const,
        resource_title: '3Blue1Brown Neural Networks',
        resource_url: 'https://www.youtube.com/playlist?list=PLZHQObOWTQDNU6R1_67000Dx_ZCJB-3pi',
      },
      {
        concept_name: 'Convolutional Neural Networks',
        why_needed: 'Core architecture used in virtually all medical imaging papers reviewed.',
        resource_type: 'article' as const,
        resource_title: 'CS231n CNN notes',
        resource_url: 'https://cs231n.github.io/convolutional-networks/',
      },
      {
        concept_name: 'Transfer Learning',
        why_needed: 'Explains why ImageNet pretraining helps when medical data are limited.',
        resource_type: 'course' as const,
        resource_title: 'Fast.ai Practical Deep Learning',
        resource_url: 'https://course.fast.ai/',
      },
      {
        concept_name: 'Clinical Metrics (Sensitivity / Specificity)',
        why_needed: 'Papers report diagnostic performance using these terms beyond raw accuracy.',
        resource_type: 'definition' as const,
        resource_title: 'ML classification metrics',
        resource_url: 'https://developers.google.com/machine-learning/crash-course/classification',
      },
    ],
  }

  await prisma.aICache.upsert({
    where: { paperId_cacheType_level: { paperId: paper.id, cacheType: 'simplify', level: 'student' } },
    update: { content: simplifyStudent, expiresAt: exp },
    create: {
      paperId: paper.id,
      cacheType: 'simplify',
      level: 'student',
      content: simplifyStudent,
      expiresAt: exp,
    },
  })

  await prisma.aICache.upsert({
    where: { paperId_cacheType_level: { paperId: paper.id, cacheType: 'simplify', level: 'researcher' } },
    update: { content: simplifyResearcher, expiresAt: exp },
    create: {
      paperId: paper.id,
      cacheType: 'simplify',
      level: 'researcher',
      content: simplifyResearcher,
      expiresAt: exp,
    },
  })

  await prisma.aICache.upsert({
    where: { paperId_cacheType_level: { paperId: paper.id, cacheType: 'project_ideas', level: '' } },
    update: { content: projectIdeas, expiresAt: exp },
    create: {
      paperId: paper.id,
      cacheType: 'project_ideas',
      level: '',
      content: projectIdeas,
      expiresAt: exp,
    },
  })

  await prisma.aICache.upsert({
    where: { paperId_cacheType_level: { paperId: paper.id, cacheType: 'concept_path', level: '' } },
    update: { content: conceptPath, expiresAt: exp },
    create: {
      paperId: paper.id,
      cacheType: 'concept_path',
      level: '',
      content: conceptPath,
      expiresAt: exp,
    },
  })

  console.log('Seed complete')
}

main().catch(console.error).finally(() => prisma.$disconnect())
