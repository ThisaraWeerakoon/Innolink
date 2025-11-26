package com.innovest.service;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.graphics.state.PDExtendedGraphicsState;
import org.apache.pdfbox.util.Matrix;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.time.LocalDate;

@Service
public class PdfWatermarkService {

    public byte[] watermarkPdf(InputStream originalPdf, String userEmail) throws IOException {
        try (PDDocument document = PDDocument.load(originalPdf)) {
            String watermarkText = "Downloaded by " + userEmail + " on " + LocalDate.now();

            for (PDPage page : document.getPages()) {
                try (PDPageContentStream contentStream = new PDPageContentStream(document, page, PDPageContentStream.AppendMode.APPEND, true, true)) {
                    contentStream.setFont(PDType1Font.HELVETICA_BOLD, 30);
                    
                    PDExtendedGraphicsState graphicsState = new PDExtendedGraphicsState();
                    graphicsState.setNonStrokingAlphaConstant(0.2f);
                    contentStream.setGraphicsStateParameters(graphicsState);

                    float pageWidth = page.getMediaBox().getWidth();
                    float pageHeight = page.getMediaBox().getHeight();
                    
                    // Calculate diagonal position
                    contentStream.beginText();
                    contentStream.setTextMatrix(Matrix.getRotateInstance(Math.toRadians(45), 200, 200));
                    
                    contentStream.newLineAtOffset(100, 100); // Approximate center
                    contentStream.showText(watermarkText);
                    contentStream.endText();
                }
            }

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            document.save(baos);
            return baos.toByteArray();
        }
    }
}
