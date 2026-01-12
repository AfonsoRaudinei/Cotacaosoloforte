11:05
<function_results>File created successfully: /mnt/user-data/outputs/app.js</parameter> <parameter name="command">cat >> /mnt/user-data/outputs/app.js << 'EOFJS2' state.insumos.forEach(insumo => { const typeInfo = getInsumoTypeInfo(insumo.type); let dap = 0;

        switch (insumo.type) {
            case 'fertilizer':
                dap = -30;
                break;
            case 'defensive':
                dap = fenologyData[insumo.stage] || 0;
                break;
            default:
                dap = 0;
        }
        
        const appDate = new Date(baseDate);
        appDate.setDate(appDate.getDate() + dap);
        
        const products = insumo.products.map(p => p.name).filter(n => n).join(', ');
        if (products) {
            timelineData.push([
                dap >= 0 ? `DAP ${dap}` : `${Math.abs(dap)}d antes`,
                appDate.toLocaleDateString('pt-BR'),
                typeInfo.name,
                products.substring(0, 40) + (products.length > 40 ? '...' : '')
            ]);
        }
    });
    
    if (timelineData.length > 0) {
        doc.autoTable({
            startY: finalY,
            head: [['Período', 'Data', 'Tipo', 'Produtos']],
            body: timelineData,
            theme: 'striped',
            headStyles: {
                fillColor: [52, 199, 89],
                textColor: 255,
                fontStyle: 'bold'
            },
            styles: {
                fontSize: 8,
                cellPadding: 3
            }
        });
    }
}

doc.setTextColor(150);
doc.setFontSize(8);
doc.setFont(undefined, 'normal');
doc.text('Gerado por AgriCotação Pro em ' + new Date().toLocaleDateString('pt-BR'), 105, 285, { align: 'center' });

const filename = `${state.settings.exportFileName || 'AgriCotacao'}_${state.farmData.farm || 'Fazenda'}_${new Date().toISOString().split('T')[0]}.pdf`;
doc.save(filename);
}

// ==================== INIT ==================== init(); EOFJS2 echo "Arquivo app.js completo criado!" </parameter> <parameter name="description">Completando arquivo app.js com funções de exportação PDF</parameter>

