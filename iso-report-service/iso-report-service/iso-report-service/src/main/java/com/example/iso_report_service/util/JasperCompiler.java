package com.example.iso_report_service.util;

import net.sf.jasperreports.engine.JasperCompileManager;

import java.io.File;

public class JasperCompiler {

    public static void main(String[] args) {
        try {
            // 🔁 Fichiers à compiler
            compile("src/main/resources/reports/response_fields_subreport.jrxml");
            compile("src/main/resources/reports/transaction_logs_subreport.jrxml");

            System.out.println("✅ Compilation terminée avec succès !");
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private static void compile(String jrxmlPath) throws Exception {
        File sourceFile = new File(jrxmlPath);
        String jasperPath = jrxmlPath.replace(".jrxml", ".jasper");
        JasperCompileManager.compileReportToFile(sourceFile.getAbsolutePath(), jasperPath);
        System.out.println("📄 Compilé : " + jasperPath);
    }
}
