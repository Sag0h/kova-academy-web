-- Normalize any duplicated service positions before enforcing uniqueness.
WITH ordered_services AS (
  SELECT
    "id",
    ROW_NUMBER() OVER (ORDER BY "orden" ASC, "createdAt" ASC, "id" ASC)::INTEGER AS "newOrder"
  FROM "Servicio"
)
UPDATE "Servicio"
SET "orden" = ordered_services."newOrder"
FROM ordered_services
WHERE "Servicio"."id" = ordered_services."id";

-- CreateIndex
CREATE UNIQUE INDEX "Servicio_orden_key" ON "Servicio"("orden");
