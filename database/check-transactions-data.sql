-- ============================================
-- VERIFICAR DATOS EXISTENTES EN TRANSACTIONS
-- ============================================

-- Ver qué valores hay en la columna cash_box actual
SELECT DISTINCT cash_box, COUNT(*) as cantidad
FROM transactions 
WHERE cash_box IS NOT NULL 
GROUP BY cash_box
ORDER BY cantidad DESC;
