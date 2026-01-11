
export const exportUtils = {
    downloadAsCSV: (data: any[], filename: string) => {
        if (data.length === 0) return;

        const headers = Object.keys(data[0]).join(',');
        const rows = data.map(obj =>
            Object.values(obj).map(val => `"${val}"`).join(',')
        ).join('\n');

        const csvContent = `${headers}\n${rows}`;
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `${filename}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    },

    printCertificate: (elementId: string) => {
        const printContents = document.getElementById(elementId)?.innerHTML;
        const originalContents = document.body.innerHTML;

        if (printContents) {
            document.body.innerHTML = printContents;
            window.print();
            document.body.innerHTML = originalContents;
            window.location.reload(); // To restore event listeners
        }
    }
};
