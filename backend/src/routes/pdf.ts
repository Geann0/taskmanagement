import express, { Request, Response } from 'express';
import { Project } from '../models/Project';
import jsPDF from 'jspdf';

const router = express.Router({ mergeParams: true });

/**
 * @swagger
 * /projects/{projectId}/export/pdf:
 *   get:
 *     summary: Export project as PDF
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *     responses:
 *       200:
 *         description: PDF file
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Project not found
 *       500:
 *         description: Server error
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const userId = (req as any).userId;

    const project = await Project.findById(projectId).populate('members.userId', 'name email');

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Check if user is a member
    const isMember = project.members.some((m) => m.userId._id.toString() === userId);
    if (!isMember) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Create PDF
    const doc = new jsPDF();
    let yPosition = 20;

    // Title
    doc.setFontSize(20);
    doc.text(project.name, 20, yPosition);
    yPosition += 10;

    // Description
    if (project.description) {
      doc.setFontSize(12);
      doc.text(`Description: ${project.description}`, 20, yPosition);
      yPosition += 10;
    }

    // Visibility
    doc.setFontSize(10);
    doc.text(`Visibility: ${project.visibility}`, 20, yPosition);
    yPosition += 5;
    doc.text(`Created: ${project.createdAt.toLocaleDateString()}`, 20, yPosition);
    yPosition += 15;

    // Members
    doc.setFontSize(14);
    doc.text('Members:', 20, yPosition);
    yPosition += 7;
    doc.setFontSize(10);

    project.members.forEach((member: any) => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }
      doc.text(`- ${member.userId.name} (${member.userId.email}) - ${member.role}`, 25, yPosition);
      yPosition += 6;
    });

    yPosition += 10;

    // Boards
    doc.setFontSize(14);
    doc.text('Boards:', 20, yPosition);
    yPosition += 7;

    project.boards.forEach((board: any) => {
      if (yPosition > 260) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(12);
      doc.text(board.name, 25, yPosition);
      yPosition += 6;

      // Columns
      board.columns.forEach((column: any) => {
        if (yPosition > 260) {
          doc.addPage();
          yPosition = 20;
        }

        doc.setFontSize(10);
        doc.text(`  ${column.name}:`, 30, yPosition);
        yPosition += 5;

        // Cards
        if (column.cards && column.cards.length > 0) {
          column.cards.forEach((card: any) => {
            if (yPosition > 270) {
              doc.addPage();
              yPosition = 20;
            }

            doc.setFontSize(9);
            doc.text(`    • ${card.title}`, 35, yPosition);
            yPosition += 4;

            if (card.description) {
              const splitDesc = doc.splitTextToSize(card.description, 150);
              splitDesc.forEach((line: string) => {
                if (yPosition > 275) {
                  doc.addPage();
                  yPosition = 20;
                }
                doc.text(`      ${line}`, 40, yPosition);
                yPosition += 4;
              });
            }
          });
        } else {
          doc.setFontSize(9);
          doc.text('    (no cards)', 35, yPosition);
          yPosition += 4;
        }

        yPosition += 3;
      });

      yPosition += 5;
    });

    // Generate PDF buffer
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));

    // Send PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${project.name.replace(/[^a-z0-9]/gi, '_')}.pdf"`
    );
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
});

export default router;
