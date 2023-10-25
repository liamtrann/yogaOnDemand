/**
 * @swagger
 * components:
 *   schemas:
 *     PaginationInfo:
 *       required:
 *         - disableNext
 *         - total
 *       properties:
 *         disableNext:
 *           type: boolean
 *         total:
 *           type: number
 */
export interface PaginationInfo {
    disableNext: boolean;
    total: number;
}