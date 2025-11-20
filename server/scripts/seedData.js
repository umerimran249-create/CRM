const User = require('../models/User');
const Client = require('../models/Client');
const Project = require('../models/Project');
const Task = require('../models/Task');
const FinanceEntry = require('../models/FinanceEntry');

async function clearData() {
  await Promise.all([
    User.storage.writeAll([]),
    Client.storage.writeAll([]),
    Project.storage.writeAll([]),
    Task.storage.writeAll([]),
    FinanceEntry.storage.writeAll([]),
  ]);
}

async function seed() {
  try {
    console.log('🧹 Clearing existing data...');
    await clearData();

    console.log('👥 Creating users...');
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@crm.com',
      password: 'admin123',
      role: 'Admin',
      department: 'Management',
    });

    const projectManager = await User.create({
      name: 'Sophia Williams',
      email: 'sophia.pm@crm.com',
      password: 'password123',
      role: 'Project Manager',
      department: 'Management',
    });

    const designer = await User.create({
      name: 'James Carter',
      email: 'james.design@crm.com',
      password: 'password123',
      role: 'Team Member',
      department: 'Design',
    });

    const copywriter = await User.create({
      name: 'Emily Davis',
      email: 'emily.copy@crm.com',
      password: 'password123',
      role: 'Team Member',
      department: 'Copy',
    });

    const financeUser = await User.create({
      name: 'Michael Chen',
      email: 'michael.finance@crm.com',
      password: 'password123',
      role: 'Finance User',
      department: 'Finance',
    });

    console.log('👔 Creating clients...');
    const clientA = await Client.create({
      name: 'Starline Enterprises',
      contactInfo: {
        email: 'contact@starline.com',
        phone: '+1 (555) 111-2233',
        address: '125 Market Street, Suite 400, San Francisco, CA',
      },
      industry: 'Technology',
      contractDate: '2024-05-10',
      accountManager: projectManager._id,
    });

    const clientB = await Client.create({
      name: 'GreenLeaf Foods',
      contactInfo: {
        email: 'hello@greenleaffoods.com',
        phone: '+1 (555) 987-6543',
        address: '22 Harvest Road, Seattle, WA',
      },
      industry: 'Food & Beverage',
      contractDate: '2024-02-20',
      accountManager: projectManager._id,
    });

    console.log('📁 Creating projects...');
    const productLaunchProject = await Project.create({
      name: 'Q4 Product Launch Campaign',
      client: clientA._id,
      category: 'Social Media',
      startDate: '2024-08-01',
      endDate: '2024-10-31',
      status: 'Active',
      estimatedBudget: 85000,
      actualExpenses: 23000,
      revenueReceived: 45000,
      projectLead: projectManager._id,
      teamMembers: [designer._id, copywriter._id],
    });

    const rebrandingProject = await Project.create({
      name: 'Brand Refresh & Website Revamp',
      client: clientB._id,
      category: 'Branding',
      startDate: '2024-03-15',
      endDate: '2024-07-30',
      status: 'Awaiting Client Approval',
      estimatedBudget: 62000,
      actualExpenses: 51000,
      revenueReceived: 58000,
      projectLead: projectManager._id,
      teamMembers: [designer._id, copywriter._id],
      completionSummary: {
        totalHours: 420,
        deliverables: ['Brand Guidelines', 'Website Mockups', 'Marketing Assets'],
        outcome: 'Awaiting final approval from client after revision round.',
        completedAt: '2024-07-30T15:00:00.000Z',
      },
    });

    console.log('📝 Creating tasks...');
    await Task.create({
      title: 'Landing Page Design',
      description: 'Design high-converting landing page for product launch campaign.',
      project: productLaunchProject._id,
      assignedTo: designer._id,
      dueDate: '2024-09-10',
      status: 'In Progress',
      priority: 'High',
      checklist: [
        { item: 'Wireframe layout', completed: true },
        { item: 'Design hero section', completed: true },
        { item: 'Finalize UI elements', completed: false },
      ],
      internalNotes: [
        {
          note: 'Client prefers a darker theme with bold typography.',
          author: projectManager._id,
          createdAt: '2024-08-15T10:12:00.000Z',
        },
      ],
      activityLog: [
        {
          action: 'Task created',
          user: projectManager._id,
          timestamp: '2024-08-01T09:00:00.000Z',
        },
        {
          action: 'Status changed from To Do to In Progress',
          user: designer._id,
          timestamp: '2024-08-20T13:45:00.000Z',
        },
      ],
      deliverables: [
        {
          filename: 'landing-page-v1.fig',
          url: 'https://example.com/landing-page-v1.fig',
          version: 1,
          uploadedAt: '2024-08-25T18:20:00.000Z',
          status: 'Draft',
        },
      ],
    });

    await Task.create({
      title: 'Product Announcement Email Sequence',
      description: 'Craft 3-email sequence for launch announcement and follow-up reminders.',
      project: productLaunchProject._id,
      assignedTo: copywriter._id,
      dueDate: '2024-09-05',
      status: 'Review',
      priority: 'Medium',
      checklist: [
        { item: 'Outline sequence', completed: true },
        { item: 'Draft emails', completed: true },
        { item: 'Incorporate stakeholder feedback', completed: false },
      ],
      internalNotes: [
        {
          note: 'Need updated product specs from engineering team.',
          author: copywriter._id,
          createdAt: '2024-08-22T16:05:00.000Z',
        },
      ],
      activityLog: [
        {
          action: 'Task created',
          user: projectManager._id,
          timestamp: '2024-08-01T09:15:00.000Z',
        },
        {
          action: 'Status changed from In Progress to Review',
          user: copywriter._id,
          timestamp: '2024-08-28T11:40:00.000Z',
        },
      ],
      deliverables: [
        {
          filename: 'email-sequence-v2.docx',
          url: 'https://example.com/email-sequence-v2.docx',
          version: 2,
          uploadedAt: '2024-08-28T11:35:00.000Z',
          status: 'Submitted for Review',
        },
      ],
    });

    await Task.create({
      title: 'Brand Guidelines Revisions',
      description: 'Incorporate client feedback into final brand guideline document.',
      project: rebrandingProject._id,
      assignedTo: designer._id,
      dueDate: '2024-07-15',
      status: 'Awaiting Client Approval',
      priority: 'Urgent',
      checklist: [
        { item: 'Update color palette section', completed: true },
        { item: 'Revise typography examples', completed: true },
        { item: 'Add usage examples', completed: true },
      ],
      internalNotes: [
        {
          note: 'Client requested additional mockups for packaging design.',
          author: projectManager._id,
          createdAt: '2024-07-11T09:30:00.000Z',
        },
      ],
      activityLog: [
        {
          action: 'Task created',
          user: projectManager._id,
          timestamp: '2024-06-10T10:00:00.000Z',
        },
        {
          action: 'Status changed from Review to Awaiting Client Approval',
          user: projectManager._id,
          timestamp: '2024-07-20T15:50:00.000Z',
        },
      ],
      deliverables: [
        {
          filename: 'brand-guidelines-final.pdf',
          url: 'https://example.com/brand-guidelines-final.pdf',
          version: 3,
          uploadedAt: '2024-07-18T14:10:00.000Z',
          status: 'Submitted for Review',
        },
      ],
    });

    console.log('💰 Creating finance entries...');
    const financeEntries = [
      {
        type: 'Expense',
        project: productLaunchProject._id,
        date: '2024-08-05',
        amount: 4500,
        description: 'Paid influencer partnership fees',
        category: 'Marketing',
        enteredBy: financeUser._id,
        invoiceNumber: 'INV-4521',
        paymentDeadline: '2024-08-20',
        isPaid: true,
      },
      {
        type: 'Expense',
        project: productLaunchProject._id,
        date: '2024-08-12',
        amount: 3800,
        description: 'Purchased ad inventory for Q4 campaign',
        category: 'Advertising',
        enteredBy: financeUser._id,
        invoiceNumber: 'INV-4587',
        paymentDeadline: '2024-09-01',
        isPaid: false,
      },
      {
        type: 'Revenue',
        project: productLaunchProject._id,
        date: '2024-08-18',
        amount: 25000,
        description: 'Received 50% upfront payment from client',
        category: 'Client Payment',
        enteredBy: financeUser._id,
        invoiceNumber: 'INV-4623',
        paymentDeadline: '2024-08-25',
        isPaid: true,
      },
      {
        type: 'Expense',
        project: rebrandingProject._id,
        date: '2024-05-22',
        amount: 7200,
        description: 'Contracted external UX consultant',
        category: 'Consulting',
        enteredBy: financeUser._id,
        invoiceNumber: 'INV-4333',
        paymentDeadline: '2024-06-15',
        isPaid: true,
      },
      {
        type: 'Revenue',
        project: rebrandingProject._id,
        date: '2024-07-05',
        amount: 33000,
        description: 'Final payment for branding engagement',
        category: 'Client Payment',
        enteredBy: financeUser._id,
        invoiceNumber: 'INV-4409',
        paymentDeadline: '2024-07-20',
        isPaid: false,
      },
    ];

    for (const entry of financeEntries) {
      await FinanceEntry.create(entry);
    }

    console.log('✅ Seeding completed successfully!');
    console.log('\nLogin with:');
    console.log('Admin -> admin@crm.com / admin123');
    console.log('Project Manager -> sophia.pm@crm.com / password123');
    console.log('Designer -> james.design@crm.com / password123');
    console.log('Copywriter -> emily.copy@crm.com / password123');
    console.log('Finance -> michael.finance@crm.com / password123');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seed();


