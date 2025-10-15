# **App Name**: Pool Parser Pro

## Core Features:

- Data Extraction from Image/Text: Extract data from a Uniswap LP position screenshot or text input using OCR and regex parsing, including handling of localized number formats.
- Form Auto-Population: Automatically populate a form with the extracted and normalized data, allowing for user review and adjustment before saving. Highlight fields with low confidence scores, providing a tool that alerts users for manual revision.
- Pool Data Storage and Management: Store pool data and snapshots in a database (Supabase/Firebase) with a schema optimized for tracking ROI, fees, and performance over time.
- Dashboard Metrics and Visualization: Display key metrics like ROI, profit/loss, fees collected, and monthly yield in a dashboard, with filters for network, pair, and version. Include the ability to flag any unusual metrics for possible manual review by a user, providing the user a chance to take appropriate action.
- Automated Calculations: Automatically calculate initial value, current value, profit/loss (USD), % profit, ROI, and yield, to measure and keep records on a given pools return. The calculations automatically update from latest data.
- Data Export: Enable exporting pool data and snapshots in CSV format for external analysis and record-keeping.
- Authentication and Security: Secure the application with user authentication (Supabase Auth) and maintain a history of snapshots without overwriting data, enabling data lineage and auditability.

## Style Guidelines:

- Primary color: Deep blue (#3F51B5) to convey trust and stability, suitable for financial data visualization.
- Background color: Very light blue (#E8EAF6), creating a clean and professional interface with sufficient contrast to ensure readability.
- Accent color: Soft teal (#80CBC4) for highlights and interactive elements, providing visual interest without being distracting.
- Body and headline font: 'Inter' for a modern, clean, and readable sans-serif.
- Use simple, geometric icons to represent different pool types and metrics.
- Use a clean, well-organized layout with clear section headings and ample spacing to ensure readability and ease of use.
- Subtle transitions and animations to provide feedback and guide the user through the process.