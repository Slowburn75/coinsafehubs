export class CSVExport {
    /**
     * Converts an array of objects to a CSV string.
     */
    static toCSV(data: any[]): string {
        if (!data || data.length === 0) return ''

        const headers = Object.keys(data[0])
        const csvRows = []

        // Add headers
        csvRows.push(headers.join(','))

        // Add data rows
        for (const row of data) {
            const values = headers.map(header => {
                const value = row[header]
                const escaped = ('' + value).replace(/"/g, '""') // Escape double quotes
                return `"${escaped}"`
            })
            csvRows.push(values.join(','))
        }

        return csvRows.join('\n')
    }

    /**
     * Specifically formats user data for export.
     */
    static formatUsers(users: any[]): string {
        const formatted = users.map(u => ({
            ID: u.id,
            Email: u.email,
            Role: u.role,
            KYC_Status: u.kycStatus,
            Active: u.isActive,
            Created_At: u.createdAt.toISOString(),
            Updated_At: u.updatedAt.toISOString(),
        }))
        return this.toCSV(formatted)
    }

    /**
     * Specifically formats audit logs for export.
     */
    static formatAuditLogs(logs: any[]): string {
        const formatted = logs.map(l => ({
            ID: l.id,
            Admin_ID: l.userId,
            Action: l.action,
            Entity: l.entity,
            Entity_ID: l.entityId,
            IP_Address: l.ipAddress,
            User_Agent: l.userAgent,
            Timestamp: l.createdAt.toISOString(),
            Metadata: JSON.stringify(l.metadata || {}),
        }))
        return this.toCSV(formatted)
    }
}
