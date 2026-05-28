#!/usr/bin/env python3
# treinar_modelo.py - Treina modelo de Machine Learning para análise de sentimentos

import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, classification_report, confusion_matrix
import joblib
import nltk
from nltk.corpus import stopwords
import re
import json

# Download stopwords em português
try:
    nltk.download('stopwords', quiet=True)
except:
    pass

stop_words = set(stopwords.words('portuguese'))

# Dados de treinamento (comentários em português)
dados = [
    # POSITIVOS 😊 (30 exemplos)
    ("Este site é maravilhoso, adorei!", "positivo"),
    ("Melhor loja de jogos que já comprei!", "positivo"),
    ("Atendimento excelente, recomendo demais!", "positivo"),
    ("Site muito bom, fácil de usar", "positivo"),
    ("Gostei muito da experiência", "positivo"),
    ("Produtos de qualidade, entrega rápida", "positivo"),
    ("Recomendo a todos meus amigos", "positivo"),
    ("Excelente plataforma de jogos", "positivo"),
    ("Nota 10 para o site", "positivo"),
    ("Amei os jogos disponíveis", "positivo"),
    ("Site incrível, vou comprar mais", "positivo"),
    ("Melhor custo-benefício", "positivo"),
    ("Superou minhas expectativas", "positivo"),
    ("Funciona perfeitamente", "positivo"),
    ("Parabéns pelo trabalho", "positivo"),
    ("Que site legal, gostei muito!", "positivo"),
    ("Atendimento rápido e eficiente", "positivo"),
    ("Os preços são ótimos", "positivo"),
    ("Entrega super rápida", "positivo"),
    ("Site muito intuitivo", "positivo"),
    ("Jogos de qualidade", "positivo"),
    ("Suporte atencioso", "positivo"),
    ("Recomendo fortemente", "positivo"),
    ("Melhor que a concorrência", "positivo"),
    ("Valeu cada centavo", "positivo"),
    ("Experiência fantástica", "positivo"),
    ("Tudo perfeito", "positivo"),
    ("Nota mil", "positivo"),
    ("Show de bola", "positivo"),
    ("Top demais", "positivo"),
    
    # NEGATIVOS 😔 (30 exemplos)
    ("Péssimo atendimento, não recomendo", "negativo"),
    ("Site muito lento e confuso", "negativo"),
    ("Demorou dias para entregar", "negativo"),
    ("Produto veio com defeito", "negativo"),
    ("Não gostei da experiência", "negativo"),
    ("Atendimento terrível", "negativo"),
    ("Site trava toda hora", "negativo"),
    ("Preços muito altos", "negativo"),
    ("Nunca mais compro aqui", "negativo"),
    ("Decepcionado com a compra", "negativo"),
    ("Pior site que já usei", "negativo"),
    ("Solução de problemas demorada", "negativo"),
    ("Não recomendo para ninguém", "negativo"),
    ("Frustrante, não funcionou", "negativo"),
    ("Perdi meu dinheiro", "negativo"),
    ("Que site horrível", "negativo"),
    ("Atendimento péssimo", "negativo"),
    ("Demorou muito", "negativo"),
    ("Bugado, não funciona", "negativo"),
    ("Arrependido da compra", "negativo"),
    ("Lamentável", "negativo"),
    ("Horrível", "negativo"),
    ("Ruim demais", "negativo"),
    ("Não vale o preço", "negativo"),
    ("Fiquei insatisfeito", "negativo"),
    ("Problemas no pagamento", "negativo"),
    ("Suporte demorou", "negativo"),
    ("Site confuso", "negativo"),
    ("Entrega atrasou", "negativo"),
    ("Qualidade baixa", "negativo"),
    
    # NEUTROS 😐 (20 exemplos)
    ("Site normal, nada demais", "neutro"),
    ("Atendeu as expectativas básicas", "neutro"),
    ("Poderia ser melhor", "neutro"),
    ("Ok, sem reclamações", "neutro"),
    ("Funciona mas não é ótimo", "neutro"),
    ("Regular, nada especial", "neutro"),
    ("Mais ou menos", "neutro"),
    ("Não é ruim nem bom", "neutro"),
    ("Mediano", "neutro"),
    ("Normal", "neutro"),
    ("É aceitável", "neutro"),
    ("Podia ser pior", "neutro"),
    ("Não tenho do que reclamar", "neutro"),
    ("Atende", "neutro"),
    ("Satisfatório", "neutro"),
    ("Razoável", "neutro"),
    ("Nem fede nem cheira", "neutro"),
    ("Comum", "neutro"),
    ("Padrão", "neutro"),
    ("Ok", "neutro"),
]

def limpar_texto(texto):
    """Limpa e normaliza o texto"""
    texto = texto.lower()
    texto = re.sub(r'[^a-záéíóúãõç ]', '', texto)
    palavras = texto.split()
    palavras = [p for p in palavras if p not in stop_words]
    return ' '.join(palavras)

# Preparar dados
X = [limpar_texto(t[0]) for t in dados]
y = [t[1] for t in dados]

print("=" * 60)
print("📊 TREINAMENTO DO MODELO DE MACHINE LEARNING")
print("=" * 60)
print(f"📝 Total de exemplos: {len(X)}")
print(f"   😊 Positivos: {y.count('positivo')}")
print(f"   😔 Negativos: {y.count('negativo')}")
print(f"   😐 Neutros: {y.count('neutro')}")
print()

# Vetorização
vectorizer = TfidfVectorizer(max_features=500)
X_vec = vectorizer.fit_transform(X)

# Dividir treino/teste
X_train, X_test, y_train, y_test = train_test_split(X_vec, y, test_size=0.2, random_state=42)

# Treinar modelo
model = LogisticRegression(max_iter=1000, random_state=42)
model.fit(X_train, y_train)

# Avaliar
y_pred = model.predict(X_test)

print("📈 RESULTADOS DO MODELO:")
print("-" * 40)
print(f"🎯 Acurácia: {accuracy_score(y_test, y_pred):.4f} ({accuracy_score(y_test, y_pred)*100:.2f}%)")
print(f"📊 Precisão (média): {precision_score(y_test, y_pred, average='weighted'):.4f}")
print(f"📈 Recall (média): {recall_score(y_test, y_pred, average='weighted'):.4f}")
print(f"🎯 F1-Score (média): {f1_score(y_test, y_pred, average='weighted'):.4f}")
print()

print("📋 Relatório detalhado por classe:")
print("-" * 40)
print(classification_report(y_test, y_pred))

# Matriz de confusão
print("📊 Matriz de Confusão:")
print("-" * 40)
print("               Previsto")
print("               Pos  Neg  Neu")
print(f"Realizado Pos  {confusion_matrix(y_test, y_pred, labels=['positivo','negativo','neutro'])[0][0]}    {confusion_matrix(y_test, y_pred, labels=['positivo','negativo','neutro'])[0][1]}    {confusion_matrix(y_test, y_pred, labels=['positivo','negativo','neutro'])[0][2]}")
print(f"          Neg  {confusion_matrix(y_test, y_pred, labels=['positivo','negativo','neutro'])[1][0]}    {confusion_matrix(y_test, y_pred, labels=['positivo','negativo','neutro'])[1][1]}    {confusion_matrix(y_test, y_pred, labels=['positivo','negativo','neutro'])[1][2]}")
print(f"          Neu  {confusion_matrix(y_test, y_pred, labels=['positivo','negativo','neutro'])[2][0]}    {confusion_matrix(y_test, y_pred, labels=['positivo','negativo','neutro'])[2][1]}    {confusion_matrix(y_test, y_pred, labels=['positivo','negativo','neutro'])[2][2]}")
print()

# Salvar modelo e vetorizador
joblib.dump(model, 'modelo_sentimento.pkl')
joblib.dump(vectorizer, 'vectorizer.pkl')
print("✅ Modelo salvo em 'modelo_sentimento.pkl'")
print("✅ Vetorizador salvo em 'vectorizer.pkl'")

# Testar com novos textos
print()
print("🧪 TESTANDO O MODELO COM NOVOS TEXTOS:")
print("-" * 40)
testes = [
    "Adorei o site, muito bom!",
    "Que site horrível, não gostei",
    "Site normal, sem novidades",
    "Excelente atendimento, recomendo",
    "Péssima experiência, site lento",
    "Gostei muito, vou comprar mais",
    "Não recomendo, muito caro",
]

for texto in testes:
    texto_limpo = limpar_texto(texto)
    vec = vectorizer.transform([texto_limpo])
    pred = model.predict(vec)[0]
    proba = model.predict_proba(vec)[0].max()
    emoji = "😊" if pred == "positivo" else ("😔" if pred == "negativo" else "😐")
    print(f"   {emoji} '{texto}' -> {pred.upper()} (confiança: {proba:.2f})")

print()
print("=" * 60)
print("✅ TREINAMENTO CONCLUÍDO COM SUCESSO!")
print("=" * 60)