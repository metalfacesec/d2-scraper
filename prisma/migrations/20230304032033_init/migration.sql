-- CreateTable
CREATE TABLE "Item" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "type" VARCHAR(255) NOT NULL,
    "rarity" TEXT NOT NULL,
    "quality" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "dynamicStats" TEXT[],
    "staticStats" TEXT[],

    CONSTRAINT "Item_pkey" PRIMARY KEY ("id")
);
