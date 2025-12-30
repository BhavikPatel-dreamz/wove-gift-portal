'use client'

import React, { useEffect, useState } from 'react'
import VouchersTab from '../../../../../../../components/settlements/VouchersTab'
import { useParams } from 'next/navigation';


const page = () => {
    const params = useParams();
    const settlementId = params.settlementId;
   
    return (
        <>
            <VouchersTab settlementId={settlementId} />
        </>
       
    )
}

export default page