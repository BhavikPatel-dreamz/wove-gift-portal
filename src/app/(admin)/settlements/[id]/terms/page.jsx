import React from 'react'
import SettlementTabs from '../../../../../components/settlements/SettlementTabs'
import SettlementTermsPage from '../../../../../components/settlements/SettlementTermsPage'

const page = () => {

    return (
        <div className="relative flex min-h-screen w-full flex-col bg-[#f7f8fa]">
            <main className="flex w-full flex-1 justify-center py-8 sm:py-12">
                <div className="flex w-full max-w-7xl flex-col gap-8 px-4 sm:px-6 lg:px-8">
                    <SettlementTabs />
                    <SettlementTermsPage />
                </div>
            </main>
        </div>
    )
}

export default page