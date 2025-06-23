#!/bin/bash
# 🧪 Script para criar arquivos CSV para testar validação de registros
# Execução: chmod +x create_validation_tests.sh && ./create_validation_tests.sh

echo "🧪 Criando arquivos para teste de validação de registros..."
echo ""

# ===== ARQUIVO 1: MUITO PEQUENO (2 registros) =====
echo "❌ Criando arquivo muito pequeno (2 registros)..."
cat > uuids_muito_pequeno.csv << 'EOF'
UUID
550e8400-e29b-41d4-a716-446655440000
6ba7b810-9dad-11d1-80b4-00c04fd430c8
EOF

# ===== ARQUIVO 2: QUASE NO LIMITE (4 registros) =====
echo "❌ Criando arquivo quase no limite (4 registros)..."
cat > uuids_quase_limite.csv << 'EOF'
UUID
550e8400-e29b-41d4-a716-446655440000
6ba7b810-9dad-11d1-80b4-00c04fd430c8
123e4567-e89b-12d3-a456-426614174000
f47ac10b-58cc-4372-a567-0e02b2c3d479
EOF

# ===== ARQUIVO 3: NO LIMITE MÍNIMO (5 registros) =====
echo "✅ Criando arquivo no limite mínimo (5 registros)..."
cat > uuids_limite_minimo.csv << 'EOF'
UUID
550e8400-e29b-41d4-a716-446655440000
6ba7b810-9dad-11d1-80b4-00c04fd430c8
123e4567-e89b-12d3-a456-426614174000
f47ac10b-58cc-4372-a567-0e02b2c3d479
a3bb189e-8bf9-3888-9912-ace4e6543002
EOF

# ===== ARQUIVO 4: VAZIO (só header) =====
echo "❌ Criando arquivo vazio..."
cat > uuids_vazio.csv << 'EOF'
UUID
EOF

# ===== ARQUIVO 5: APENAS HEADER (sem dados) =====
echo "❌ Criando arquivo apenas com header..."
echo "UUID" > uuids_apenas_header.csv

# ===== ARQUIVO 6: NO LIMITE MÁXIMO (1000 registros) =====
echo "✅ Criando arquivo no limite máximo (1000 registros)..."
echo "UUID" > uuids_limite_maximo.csv

# Gerar UUIDs válidos em sequência
for i in $(seq 1 1000); do
    # Usar formato UUID válido com incremento
    printf "550e8400-e29b-41d4-a716-%012d\n" $((446655440000 + i)) >> uuids_limite_maximo.csv
done

# ===== ARQUIVO 7: MUITO GRANDE (1001 registros) =====
echo "❌ Criando arquivo muito grande (1001 registros)..."
echo "UUID" > uuids_muito_grande.csv

# Gerar UUIDs válidos em sequência
for i in $(seq 1 1001); do
    printf "550e8400-e29b-41d4-a716-%012d\n" $((446655440000 + i)) >> uuids_muito_grande.csv
done

# ===== ARQUIVO 8: EXTREMAMENTE GRANDE (1500 registros) =====
echo "❌ Criando arquivo extremamente grande (1500 registros)..."
echo "UUID" > uuids_extremamente_grande.csv

# Gerar UUIDs válidos em sequência
for i in $(seq 1 1500); do
    printf "550e8400-e29b-41d4-a716-%012d\n" $((446655440000 + i)) >> uuids_extremamente_grande.csv
done

echo ""
echo "✅ Arquivos de teste criados com sucesso!"
echo ""

echo "📊 Resumo dos arquivos criados:"
echo ""

# Verificar e mostrar informações dos arquivos
for file in uuids_muito_pequeno.csv uuids_quase_limite.csv uuids_limite_minimo.csv uuids_vazio.csv uuids_apenas_header.csv uuids_limite_maximo.csv uuids_muito_grande.csv uuids_extremamente_grande.csv; do
    if [ -f "$file" ]; then
        lines=$(wc -l < "$file")
        records=$((lines - 1))  # Subtrair header
        size=$(ls -lh "$file" | awk '{print $5}')
        
        # Determinar status esperado
        if [ $records -lt 5 ]; then
            status="❌ ERRO - Muito pequeno"
        elif [ $records -gt 1000 ]; then
            status="❌ ERRO - Muito grande"
        else
            status="✅ SUCESSO"
        fi
        
        echo "📁 $file:"
        echo "   📊 Registros: $records | Tamanho: $size"
        echo "   🎯 Status: $status"
        echo ""
    fi
done

echo "🧪 Cenários de teste disponíveis:"
echo ""
echo "🔴 DEVEM DAR ERRO:"
echo "   • uuids_muito_pequeno.csv      (2 registros < 5)"
echo "   • uuids_quase_limite.csv       (4 registros < 5)"
echo "   • uuids_vazio.csv              (0 registros < 5)"
echo "   • uuids_apenas_header.csv      (0 registros < 5)"
echo "   • uuids_muito_grande.csv       (1001 registros > 1000)"
echo "   • uuids_extremamente_grande.csv (1500 registros > 1000)"
echo ""
echo "🟢 DEVEM FUNCIONAR:"
echo "   • uuids_limite_minimo.csv      (5 registros = mínimo)"
echo "   • uuids_limite_maximo.csv      (1000 registros = máximo)"
echo ""

echo "🎯 Como testar:"
echo "1. Execute sua POC: npm run dev"
echo "2. Teste cada arquivo na ordem sugerida"
echo "3. Observe os alertas específicos para cada erro"
echo ""

echo "📋 Alertas esperados:"
echo "❌ < 5 registros  → Alert vermelho 'Arquivo Muito Pequeno'"
echo "❌ > 1000 registros → Alert laranja 'Arquivo Muito Grande'"
echo "✅ 5-1000 registros → Processamento normal"
echo ""

echo "🎉 Arquivos prontos para teste de validação!"

# Comando opcional para abrir Finder/Explorer na pasta atual
# open . 2>/dev/null || explorer . 2>/dev/null || echo "📁 Arquivos criados na pasta atual"