const functions = require('@google-cloud/functions-framework');
const admin = require('firebase-admin');
const { Storage } = require('@google-cloud/storage');
const PDFDocument = require('pdfkit');

// Initialize Firebase Admin SDK
admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: 'ca-test2-438111', // Replace with your Google Cloud project ID
});

// Initialize Firestore and Storage
const storage = new Storage();

const ownerdb = admin.firestore();
ownerdb.settings({ databaseId: "gm-owner-prod" });

// Define tenant tiers
const TenantTier = {
    ENTRY: 'ENTRY',
    ENHANCED: 'ENHANCED',
    PREMIUM: 'PREMIUM',
};

functions.cloudEvent('calculateExpenses', async (cloudEvent) => {
    try {
        const tenantsSnapshot = await ownerdb.collection("tenants").get();
        if (tenantsSnapshot.empty) {
            return res.status(404).send("Keine Tenants gefunden");
        }

        const updates = tenantsSnapshot.docs.map(async (tenantDoc) => {
            const tenantData = tenantDoc.data();
            const tenantId = tenantDoc.id;
            const tier = tenantData.tier;
            const docRef = ownerdb.collection('tenants').doc(tenantId);
            const services = tenantData.services;
            const databaseId = services.propertyDb?.url;
            let tenantSpecificAmount = 0;
            let globalExpenses = 0;



            // Function to get Firestore instance for a specific database
            function getFirestoreInstance(databaseId) {
                return new admin.firestore.Firestore({
                    projectId: process.env.GCLOUD_PROJECT,
                    databaseId,
                });
            }

            let db = getFirestoreInstance(databaseId);
            let bucketName = databaseId;

            let propertyCollection, defectCollection;

            // Determine collections based on tenant type
            if (tier === TenantTier.ENTRY) {
                bucketName = "gm-storage-prod"
                propertyCollection = db.collection('tenants').doc(tenantId).collection('properties');
                defectCollection = db.collection('tenants').doc(tenantId).collection('defects');
            } else {
                propertyCollection = db.collection('properties');
                defectCollection = db.collection('defects');
            }

            // Fetch data from collections
            const propertySnapshot = await propertyCollection.get();
            const defectSnapshot = await defectCollection.get();


            if (propertySnapshot.empty) {
                console.log('No documents found in the "properties" collection.');
                return;
            }

            const defectCount = defectSnapshot.size;
            const propertyCount = propertySnapshot.size;

            let breakdown = [];
            const effectiveTenantType = tier;

            // Calculate expenses for properties
            propertySnapshot.forEach((doc) => {
                const data = doc.data();
                if (data.expenses && Array.isArray(data.expenses)) {
                    let propertyTotalExpense = 0;
                    data.expenses.forEach((expense) => {
                        if (expense.sum) {
                            propertyTotalExpense += expense.sum;
                        }
                    });

                    globalExpenses += propertyTotalExpense;
                    breakdown.push({
                        tenantType: effectiveTenantType,
                        property: data.name,
                        expenseTotal: propertyTotalExpense.toFixed(2),
                        expenseDetails: data.expenses,
                    });
                }
            });



            // Apply tenant-specific charges
            switch (effectiveTenantType) {
                case TenantTier.ENTRY:
                    tenantSpecificAmount = 100;
                    break;
                case TenantTier.ENHANCED:
                    tenantSpecificAmount = 250;
                    break;
                case TenantTier.PREMIUM:
                    tenantSpecificAmount = 1000;
                    break;
            }

            // Add $2 per defect

            const defectCost = defectCount * 1;
            const propertyCost = propertyCount * 10;
            globalExpenses = + defectCost + propertyCost;
            globalExpenses = + tenantSpecificAmount;
            console.log(`Total expenses: ${globalExpenses.toFixed(2)} USD`);

            // PDF generation and upload (unchanged)
            const doc = new PDFDocument({ margin: 50 });
            let buffers = [];
            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', async () => {
                const pdfData = Buffer.concat(buffers);
                const bucket = storage.bucket(bucketName);
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                const fileName = `expenses_report_${timestamp}.pdf`;
                const file = bucket.file(fileName);

                await file.save(pdfData, {
                    contentType: 'application/pdf',
                });

                console.log(`PDF uploaded successfully: gs://${bucketName}/${fileName}`);
                await docRef.update({
                    'services.parkingFrontend.url': `gs://${bucketName}/${fileName}`,
                });
            });

            // PDF content generation (unchanged)
            doc.fontSize(20).font('Helvetica-Bold').text('Expense Report', { align: 'center' });
            doc.moveDown();
            doc.fontSize(14).font('Helvetica').text(`Tenant: ${databaseId}`, { align: 'center' });
            doc.text(`Date: ${new Date().toLocaleString()}`, { align: 'center' });
            doc.moveDown();

            // Add divider
            doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
            doc.moveDown();

            // Add total expenses
            doc.fontSize(16).font('Helvetica-Bold').text(`Propertysubscriptioncost: ${propertyCost.toFixed(2)} USD`, { align: 'left' });
            doc.fontSize(16).font('Helvetica-Bold').text(`Defectsubscriptioncost: ${defectCost.toFixed(2)} USD`, { align: 'left' });
            //doc.fontSize(16).font('Helvetica-Bold').text(`User Expenses (with defects): ${propertyCost.toFixed(2)} USD`, { align: 'left' });
            doc.fontSize(16).font('Helvetica-Bold').text(`Basesubscriptioncost: ${tenantSpecificAmount.toFixed(2)} USD`, { align: 'left' });
            doc.moveDown();

            // Add detailed breakdown
            breakdown.forEach((item, index) => {
                doc.fontSize(12).font('Helvetica-Bold').text(`Property ${index + 1}:`);
                doc.fontSize(12).font('Helvetica').text(`  Tenant Type: ${item.tenantType}`);
                doc.fontSize(12).font('Helvetica').text(`  Property Name: ${item.property}`);
                doc.fontSize(12).font('Helvetica').text(`  Total Expense: ${item.expenseTotal} USD`);
                item.expenseDetails.forEach((expense) => {
                    doc.fontSize(12).font('Helvetica').text(`    Purpose: ${expense.purposeOfUse || 'N/A'}`);
                    doc.fontSize(12).font('Helvetica').text(`    Receiver: ${expense.receiver || 'N/A'}`);
                    doc.fontSize(12).font('Helvetica').text(`    Sum: ${expense.sum?.toFixed(2) || 0} USD`);
                });
                doc.moveDown();
            });

            doc.fontSize(16).font('Helvetica-Bold').text(`Global Expenses: ${globalExpenses.toFixed(2)} USD`, { align: 'left' });
            // Footer
            doc.moveDown();
            doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
            doc.fontSize(10).font('Helvetica').text('Generated by the Expense Management System', { align: 'center' });

            doc.end();
        }); await Promise.all(updates);
    } catch (error) {
        console.error('Error:', error);
    }
});


