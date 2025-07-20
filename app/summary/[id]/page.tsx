
import Summary from '@/components/common/Summary'
import { ReportTable } from '@/components/Summary/ReprotTable'
import { parseAISummary } from '@/lib/parseSummary'
import { getSummaryById } from '@/lib/singleSummary'

import { notFound } from 'next/navigation'

interface PageProps {
    params: {
        id: string
    }
}

const Page = async ({ params }: PageProps) => {
    const summary = await getSummaryById(params.id)

    if (!summary) {
        return notFound() // If summary not found, show 404 page
    }




    return (
        <div className="w-full max-w-5xl mx-auto">
            <h2>{summary.fileName}</h2>
            <ReportTable markdown={summary.summaryText} />
        </div>
    )
}

export default Page
