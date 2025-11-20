const express = require('express');
const Project = require('../models/Project');
const Client = require('../models/Client');
const FinanceEntry = require('../models/FinanceEntry');
const Task = require('../models/Task');
const User = require('../models/User');
const { auth, requirePermission } = require('../middleware/auth');
const { populateReferences, populateArrayReferences } = require('../utils/populate');

// Helper to filter by date range
function filterByDateRange(items, startDate, endDate) {
  return items.filter(item => {
    const itemDate = new Date(item.date);
    if (startDate && itemDate < startDate) return false;
    if (endDate && itemDate > endDate) return false;
    return true;
  });
}

const router = express.Router();

router.get('/', auth, requirePermission('dashboard.view'), async (req, res) => {
  try {
    const now = new Date();

    // Project counts
    const allProjects = await Project.find({});
    const totalProjects = allProjects.length;
    const activeProjects = allProjects.filter(p => 
      ['Planning', 'Active', 'Review', 'Awaiting Client Approval'].includes(p.status)
    ).length;
    const completedProjects = allProjects.filter(p => p.status === 'Closed').length;

    // Financial totals
    const allFinanceEntries = await FinanceEntry.find({});
    const revenueEntries = allFinanceEntries.filter(e => e.type === 'Revenue');
    const expenseEntries = allFinanceEntries.filter(e => e.type === 'Expense');

    // Use the most recent finance entry date as reference if data is in the past
    const latestFinanceDate = (() => {
      const allDates = [...revenueEntries, ...expenseEntries]
        .map(entry => new Date(entry.date))
        .filter(date => !isNaN(date));
      if (allDates.length === 0) return now;
      const maxDate = new Date(Math.max(...allDates.map(date => date.getTime())));
      return maxDate;
    })();

    const referenceDate = latestFinanceDate > now ? now : latestFinanceDate;
    const startOfMonth = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1);
    const endOfMonth = new Date(referenceDate.getFullYear(), referenceDate.getMonth() + 1, 0);
    const startOfYear = new Date(referenceDate.getFullYear(), 0, 1);
    const endOfYear = new Date(referenceDate.getFullYear(), 11, 31);

    const monthRevenueEntries = filterByDateRange(revenueEntries, startOfMonth, endOfMonth);
    const monthExpenseEntries = filterByDateRange(expenseEntries, startOfMonth, endOfMonth);
    const ytdRevenueEntries = filterByDateRange(revenueEntries, startOfYear, endOfYear);
    const ytdExpenseEntries = filterByDateRange(expenseEntries, startOfYear, endOfYear);

    // Calculate revenue - from finance entries AND project revenueReceived
    const totalRevenueMonth = monthRevenueEntries.reduce((sum, e) => {
      const amount = typeof e.amount === 'string' ? parseFloat(e.amount) : (e.amount || 0);
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);
    
    const totalExpensesMonth = monthExpenseEntries.reduce((sum, e) => {
      const amount = typeof e.amount === 'string' ? parseFloat(e.amount) : (e.amount || 0);
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);
    
    const totalRevenueYTD = ytdRevenueEntries.reduce((sum, e) => {
      const amount = typeof e.amount === 'string' ? parseFloat(e.amount) : (e.amount || 0);
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);
    
    const totalExpensesYTD = ytdExpenseEntries.reduce((sum, e) => {
      const amount = typeof e.amount === 'string' ? parseFloat(e.amount) : (e.amount || 0);
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);

    const profitMargin = totalRevenueMonth > 0 
      ? ((totalRevenueMonth - totalExpensesMonth) / totalRevenueMonth * 100).toFixed(2)
      : 0;

    // Top clients by revenue
    const projectsWithClients = await populateReferences(allProjects, 'client', Client, ['name']);
    const clientRevenue = {};
    projectsWithClients.forEach(project => {
      const clientId = project.client?._id || project.client;
      if (clientId) {
        if (!clientRevenue[clientId]) {
          clientRevenue[clientId] = {
            client: project.client?.name || 'Unknown',
            revenue: 0,
          };
        }
        const revenue = typeof project.revenueReceived === 'string' 
          ? parseFloat(project.revenueReceived) 
          : (project.revenueReceived || 0);
        clientRevenue[clientId].revenue += isNaN(revenue) ? 0 : revenue;
      }
    });
    const topClients = Object.values(clientRevenue)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Upcoming payment deadlines
    const upcomingRevenueEntries = allFinanceEntries.filter(e => 
      e.type === 'Revenue' && 
      e.isPaid !== 'true' && 
      e.paymentDeadline &&
      new Date(e.paymentDeadline) >= now
    );
    const upcomingPayments = await populateReferences(
      upcomingRevenueEntries.slice(0, 10),
      'project',
      Project,
      ['name', 'projectId']
    );
    upcomingPayments.sort((a, b) => 
      new Date(a.paymentDeadline) - new Date(b.paymentDeadline)
    );

    // Overdue invoices
    const overdueEntries = allFinanceEntries.filter(e => 
      e.type === 'Revenue' && 
      e.isPaid !== 'true' && 
      e.paymentDeadline &&
      new Date(e.paymentDeadline) < now
    );
    const overdueInvoices = await populateReferences(
      overdueEntries,
      'project',
      Project,
      ['name', 'projectId']
    );
    overdueInvoices.sort((a, b) => 
      new Date(a.paymentDeadline) - new Date(b.paymentDeadline)
    );

    // Monthly revenue vs expense (last 12 months)
    const monthlyData = [];
    for (let i = 11; i >= 0; i--) {
      const monthStart = new Date(referenceDate.getFullYear(), referenceDate.getMonth() - i, 1);
      const monthEnd = new Date(referenceDate.getFullYear(), referenceDate.getMonth() - i + 1, 0);
      
      const monthRevenue = filterByDateRange(
        allFinanceEntries.filter(e => e.type === 'Revenue'),
        monthStart,
        monthEnd
      );
      const monthExpense = filterByDateRange(
        allFinanceEntries.filter(e => e.type === 'Expense'),
        monthStart,
        monthEnd
      );

      monthlyData.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        revenue: monthRevenue.reduce((sum, e) => {
          const amount = typeof e.amount === 'string' ? parseFloat(e.amount) : (e.amount || 0);
          return sum + (isNaN(amount) ? 0 : amount);
        }, 0),
        expenses: monthExpense.reduce((sum, e) => {
          const amount = typeof e.amount === 'string' ? parseFloat(e.amount) : (e.amount || 0);
          return sum + (isNaN(amount) ? 0 : amount);
        }, 0),
      });
    }

    // Project-wise profitability
    const closedProjects = allProjects.filter(p => p.status === 'Closed').slice(0, 10);
    const projectsWithClientNames = await populateReferences(closedProjects, 'client', Client, ['name']);
    const profitabilityData = projectsWithClientNames.map(p => ({
      project: p.name,
      profit: (() => {
        const revenue = typeof p.revenueReceived === 'string' ? parseFloat(p.revenueReceived) : (p.revenueReceived || 0);
        const expenses = typeof p.actualExpenses === 'string' ? parseFloat(p.actualExpenses) : (p.actualExpenses || 0);
        return (isNaN(revenue) ? 0 : revenue) - (isNaN(expenses) ? 0 : expenses);
      })(),
    })).sort((a, b) => b.profit - a.profit);

    // Department cost breakdown (from tasks assigned to team members)
    const allTasks = await Task.find({});
    const tasksWithUsers = await populateReferences(allTasks, 'assignedTo', User, ['department']);
    const departmentCosts = {};
    tasksWithUsers.forEach(task => {
      const dept = task.assignedTo?.department || 'Other';
      if (!departmentCosts[dept]) {
        departmentCosts[dept] = 0;
      }
      departmentCosts[dept] += 1;
    });

    res.json({
      tiles: {
        totalProjects,
        activeProjects,
        completedProjects,
        totalRevenueMonth,
        totalExpensesMonth,
        totalRevenueYTD,
        totalExpensesYTD,
        profitMargin: parseFloat(profitMargin),
        topClients,
        upcomingPayments,
        overdueInvoices,
      },
      charts: {
        monthlyRevenueVsExpense: monthlyData,
        projectProfitability: profitabilityData,
        departmentCostBreakdown: Object.entries(departmentCosts).map(([dept, cost]) => ({
          department: dept,
          cost,
        })),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
