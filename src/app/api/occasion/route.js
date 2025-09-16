import { NextResponse } from 'next/server';
import { addOccasion, updateOccasion, deleteOccasion } from '../../../lib/action/occasionAction';
import { deleteOccasionSchema } from '../../../lib/validation';



export async function POST(req) {
    const response = await addOccasion(req)

    if (response.success) {
        return NextResponse.json(
            {
                success: true,
                message: "Occasion created successfully",
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
    const response = await updateOccasion(req)
    if (response.success) {
        return NextResponse.json(
            {
                success: true,
                message: "Occasion updated successfully",
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

export async function DELETE(req) {
    try {
        // Create user
        const response = await deleteOccasion(req)
        return NextResponse.json(
            {
                success: true,
                message: "Occasion deleted successfully",
                data: response.data,
            },
            { status: response.status }
        );

    } catch (error) {
        console.log(error, "error")
        return NextResponse.json(
            {
                success: false,
                message: "Internal server error"
            }, {
            status: 500
        });
    }
}