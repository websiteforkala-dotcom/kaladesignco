const fs = require('fs');
const path = require('path');
const { marked } = require('marked');
const HTMLtoDOCX = require('html-to-docx');

async function generate() {
    try {
        let md = fs.readFileSync('ADMIN_USER_GUIDE.md', 'utf8');

        // Convert image paths to base64 so Word embeds them correctly
        // Regex to match markdown images: ![alt](path)
        const imgRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;

        md = md.replace(imgRegex, (match, altText, imgPath) => {
            try {
                const imgBuffer = fs.readFileSync(imgPath);
                const base64Str = imgBuffer.toString('base64');
                const ext = path.extname(imgPath).slice(1) || 'png';
                const dataUrl = `data:image/${ext};base64,${base64Str}`;
                return `![${altText}](${dataUrl})`;
            } catch (err) {
                console.warn(`Could not load image ${imgPath}:`, err.message);
                return match;
            }
        });

        const htmlContent = marked.parse(md);

        const finalHtml = `
            <!DOCTYPE html>
            <html>
                <head>
                    <meta charset="utf-8">
                    <title>Admin Guide</title>
                    <style>
                        body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 11pt; color: #333333; }
                        h1 { color: #1a1a1a; font-size: 24pt; margin-bottom: 12pt; }
                        h2 { color: #2c3e50; font-size: 18pt; margin-top: 18pt; border-bottom: 1px solid #eeeeee; padding-bottom: 4pt; }
                        h3 { color: #34495e; font-size: 14pt; margin-top: 14pt; }
                        p { line-height: 1.5; margin-bottom: 10pt; }
                        img { max-width: 100%; height: auto; margin: 10pt 0; border: 1px solid #eaeaea; }
                        code { background-color: #f8f9fa; padding: 2px 4px; border-radius: 4px; font-family: monospace; }
                        ul, ol { margin-bottom: 10pt; }
                        li { margin-bottom: 4pt; }
                    </style>
                </head>
                <body>
                    ${htmlContent}
                </body>
            </html>
        `;

        const fileBuffer = await HTMLtoDOCX(finalHtml, null, {
            table: { row: { cantSplit: true } },
            footer: true,
            pageNumber: true,
        });

        fs.writeFileSync('ADMIN_USER_GUIDE.docx', fileBuffer);
        console.log('Successfully generated ADMIN_USER_GUIDE.docx');
    } catch (error) {
        console.error('Error generating document:', error);
    }
}

generate();
