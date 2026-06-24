import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import { generateInvoiceHtml, InvoiceData } from '@/lib/invoiceTemplate';

export const maxDuration = 30; // Max duration for Vercel Hobby

export async function POST(req: Request) {
  try {
    const data: InvoiceData = await req.json();

    // Validate required fields
    if (!data.invoiceNumber || !data.billToName || !data.items || data.items.length === 0) {
      return NextResponse.json({ error: 'Missing required invoice data.' }, { status: 400 });
    }

    // Configure Sparticuz Chromium for Vercel Serverless Environments
    // Using default configurations tailored for AWS Lambda / Vercel Serverless
    const isDev = process.env.NODE_ENV === 'development';
    const executablePath = isDev 
      ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' 
      : await chromium.executablePath();
    
    // Fallback to local Chrome for local development
    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: { width: 1920, height: 1080 },
      executablePath: executablePath || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', // Fallback for Windows local test
      headless: true,
      
    });
    
    const page = await browser.newPage();
    
    const html = generateInvoiceHtml(data);
    
    await page.setContent(html, { waitUntil: 'load' });
    
    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '0px',
        right: '0px',
        bottom: '0px',
        left: '0px'
      }
    });

    await browser.close();

    // Return the PDF
    return new NextResponse(Buffer.from(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="facture-${data.invoiceNumber}.pdf"`
      }
    });

  } catch (error: any) {
    console.error('Invoice Generation Error:', error); 
    return NextResponse.json(
      { error: 'Failed to generate invoice.', details: error.message },
      { status: 500 }
    );
  }
}
