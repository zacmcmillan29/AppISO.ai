// script.js

// NavBar Scroll Function
document.addEventListener('DOMContentLoaded', function() {
    // Smooth scroll for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const navbarHeight = document.querySelector('.navbar').offsetHeight;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset;
                window.scrollTo({
                    top: targetPosition - navbarHeight,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Active link highlighting on scroll
    window.addEventListener('scroll', function() {
        let current = '';
        
        document.querySelectorAll('section').forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (pageYOffset >= sectionTop - 60) {
                current = section.getAttribute('id');
            }
        });

        document.querySelectorAll('.nav-link').forEach(link => {
            link.parentElement.classList.remove('active');
            if (link.getAttribute('href').substring(1) === current) {
                link.parentElement.classList.add('active');
            }
        });
    });
});



// Constants for calculations
const APPISO_TIME_PER_APP = 0.42; // Time in minutes
const PRICING_TIERS = {
    basic: {
        price: 1200,
        scansIncluded: 3000,
        extraScanCost: 0.36
    },
    mid: {
        price: 2250,
        scansIncluded: 7500,
        extraScanCost: 0.30
    },
    grande: {
        price: 4000,
        scansIncluded: 15000,
        extraScanCost: 0.27
    }
};

// Main calculation function
function calculateROI() {
    // Get input values
    const inputs = {
        dailyPdfConversions: getInputValue('dailyPdfConversions'),
        avgWorkdaysPerMonth: getInputValue('avgWorkdaysPerMonth'),
        timePerAppManual: getInputValue('timePerAppManual'),
        numDataEntrySpecialists: getInputValue('numDataEntrySpecialists'),
        dataEntrySpecialistAnnualSalary: getInputValue('dataEntrySpecialistAnnualSalary')
    };

    // Calculate basic metrics
    const metrics = calculateMetrics(inputs);

    // Update results table
    updateResultsTable(metrics);

    // Update translations
    updateTranslations(metrics);
}

// Helper function to get input values
function getInputValue(elementId) {
    return parseFloat(document.getElementById(elementId).value) || 0;
}

// Calculate all metrics
function calculateMetrics(inputs) {
    // Calculate monthly volume
    const monthlyVolume = inputs.dailyPdfConversions * inputs.avgWorkdaysPerMonth;

    // Calculate manual process costs
    const manualMonthlyCost = (inputs.numDataEntrySpecialists * inputs.dataEntrySpecialistAnnualSalary) / 12;
    const manualCostPerApp = manualMonthlyCost / monthlyVolume;

    // Calculate App.ISO costs
    const appIsoCosts = calculateAppIsoCosts(monthlyVolume);
    const appIsoCostPerApp = appIsoCosts.monthlyCost / monthlyVolume;

    // Calculate time savings
    const timePerAppManual = inputs.timePerAppManual;
    const timePerAppAppIso = APPISO_TIME_PER_APP;

    // Calculate benefit percentages
    const metrics = {
        monthlyVolume: monthlyVolume,
        manualMonthlyCost: manualMonthlyCost,
        appIsoMonthlyCost: appIsoCosts.monthlyCost,
        manualCostPerApp: manualCostPerApp,
        appIsoCostPerApp: appIsoCostPerApp,
        timePerAppManual: timePerAppManual,
        timePerAppAppIso: timePerAppAppIso,
        monthlyCostBenefit: calculateBenefitPercentage(manualMonthlyCost, appIsoCosts.monthlyCost),
        costPerAppBenefit: calculateBenefitPercentage(manualCostPerApp, appIsoCostPerApp),
        timePerAppBenefit: calculateBenefitPercentage(timePerAppManual, timePerAppAppIso)
    };

    return metrics;
}

// Calculate App.ISO costs based on volume
function calculateAppIsoCosts(monthlyVolume) {
    let tier;
    if (monthlyVolume <= PRICING_TIERS.basic.scansIncluded) {
        tier = PRICING_TIERS.basic;
    } else if (monthlyVolume <= PRICING_TIERS.mid.scansIncluded) {
        tier = PRICING_TIERS.mid;
    } else {
        tier = PRICING_TIERS.grande;
    }

    const extraScans = Math.max(0, monthlyVolume - tier.scansIncluded);
    const monthlyCost = tier.price + (extraScans * tier.extraScanCost);

    return {
        monthlyCost: monthlyCost,
        tier: tier
    };
}

// Calculate benefit percentage
function calculateBenefitPercentage(manualValue, appIsoValue) {
    return ((manualValue - appIsoValue) / appIsoValue) * 100;
}

// Update results table
function updateResultsTable(metrics) {
    // Update monthly volume
    document.getElementById('monthlyAppVolumeManual').textContent = metrics.monthlyVolume.toLocaleString();
    document.getElementById('monthlyAppVolumeAppISO').textContent = metrics.monthlyVolume.toLocaleString();

    // Update monthly costs
    document.getElementById('monthlyCostManual').textContent = formatCurrency(metrics.manualMonthlyCost);
    document.getElementById('monthlyCostAppISO').textContent = formatCurrency(metrics.appIsoMonthlyCost);
    document.getElementById('monthlyCostBenefit').textContent = formatPercentage(metrics.monthlyCostBenefit);

    // Update cost per app
    document.getElementById('costPerAppManual').textContent = formatCurrency(metrics.manualCostPerApp);
    document.getElementById('costPerAppAppISO').textContent = formatCurrency(metrics.appIsoCostPerApp);
    document.getElementById('costPerAppBenefit').textContent = formatPercentage(metrics.costPerAppBenefit);

    // Update time per app
    document.getElementById('timePerAppManualDisplay').textContent = formatDecimal(metrics.timePerAppManual);
    document.getElementById('timePerAppAppISO').textContent = formatDecimal(metrics.timePerAppAppIso);
    document.getElementById('timePerAppBenefit').textContent = formatPercentage(metrics.timePerAppBenefit);
}

// Update translations
function updateTranslations(metrics) {
    const monthlySavings = metrics.manualMonthlyCost - metrics.appIsoMonthlyCost;
    const costPerAppSavings = metrics.manualCostPerApp - metrics.appIsoCostPerApp;
    const timePerAppSavings = metrics.timePerAppManual - metrics.timePerAppAppIso;

    const translations = {
        monthly: `Based on your inputs, App.ISO could cut your costs by approximately ${formatPercentage(metrics.monthlyCostBenefit)}. 
                 That's a total of ${formatCurrency(monthlySavings)} saved every month.`,
        
        costPerApp: `App.ISO saves you approximately ${formatPercentage(metrics.costPerAppBenefit)} on every app you run. 
                    That's ${formatCurrency(costPerAppSavings)} saved per application.`,
        
        time: `App.ISO reduces processing time by ${formatPercentage(metrics.timePerAppBenefit)}. 
              You save ${formatDecimal(timePerAppSavings)} minutes on every application.`
    };

    document.getElementById('monthlyTranslation').innerHTML = translations.monthly;
    document.getElementById('costPerAppTranslation').innerHTML = translations.costPerApp;
    document.getElementById('timeTranslation').innerHTML = translations.time;
}

// Formatting helpers
function formatCurrency(value) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(value);
}

function formatPercentage(value) {
    return `${Math.round(value)}%`;
}

function formatDecimal(value) {
    return value.toFixed(2);
}

// Initialize calculator on page load
document.addEventListener('DOMContentLoaded', function() {
    // Set up any initial calculations or validations
    calculateROI();

    // Add input validation
    const inputs = document.querySelectorAll('input[type="number"]');
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            if (this.value < 0) this.value = 0;
        });
    });
});
