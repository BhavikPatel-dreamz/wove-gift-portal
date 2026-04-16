import { NextResponse } from 'next/server';
import { addBrand, deleteBrand, updateBrand } from '../../../lib/action/brandAction';
import { prisma } from '../../../lib/db';


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
                message: error instanceof Error ? error.message : "Internal server error"
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
                message: error instanceof Error ? error.message : "Internal server error"
            }, {
            status: 500
        });
    }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get("active") === "true";
    const limit = parseInt(searchParams.get("limit")) || 100;
    const shop = searchParams.get("shop");

    const whereClause = {};
    if (activeOnly) {
      whereClause.isActive = true;
    }
    

    if (shop && shop !== "undefined") {
        whereClause.domain = shop;
    }

    const brands = await prisma.brand.findMany({
      where: whereClause,
      select: {
        id: true,
        brandName: true,
        logo: true,
        categoryName: true,
        isActive: true,
        isFeature: true,
      },
      orderBy: {
        brandName: "asc",
      },
      take: limit,
    });

    return NextResponse.json({
      success: true,
      data: brands,
      count: brands.length,
    });
  } catch (error) {
    console.error("Brands API Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch brands",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Internal server error",
      },
      { status: 500 }
    );
  }
}

