import { NextResponse } from 'next/server';
import { addBrand, deleteBrand, updateBrand } from '../../../lib/action/brandAction';


export async function POST(req) {
    const response = await addBrand(req);

    if (response.success) {
        return NextResponse.json(
            {
                success: true,
                message: "Brand created successfully",
                data: response.data,
            },
            { status: response.status }
        );
    } else {
        return NextResponse.json(
            {
                success: false,
                message: response.message,
            },
            { status: response.status }
        );
    }
}

export async function PATCH(req) {
    try {
        const response = await updateBrand(req)

        if (response.success) {
            return NextResponse.json(
                {
                    success: true,
                    message: "Brand updated successfully",
                    data: response.brand,
                },
                { status: response.status }
            );
        } else {
            return NextResponse.json(
                {
                    success: false,
                    message: response.message,
                },
                { status: response.status }
            );
        }
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                message: "Internal server error"
            }, {
            status: 500
        });
    }


}

export async function DELETE(req) {
    try {
        const response = await deleteBrand(req)
        if (response.success) {
            return NextResponse.json(
                {
                    success: true,
                    message: "Brand deleted successfully",
                },
                { status: response.status }
            );

        } else {
            return NextResponse.json(
                {
                    success: false,
                    message: response.message,
                },
                { status: response.status }
            );
        }
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                message: "Internal server error"
            }, {
            status: 500
        });
    }
}