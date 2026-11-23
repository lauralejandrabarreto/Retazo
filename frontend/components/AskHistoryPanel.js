import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Linking, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { C, F, RADIUS } from '../theme';
import NoticeBox from './NoticeBox';
import { askPlace, QUESTION_MIN, QUESTION_MAX } from '../services/placesService';

// Asistente histórico: el usuario pregunta sobre el lugar y el backend responde
// con RAG (recupera fragmentos de las fuentes del lugar y redacta la respuesta
// citándolos). Muestra la respuesta, las citas y de qué modo se generó.

const SUGGESTIONS = ['¿Cuándo se construyó?', '¿Qué pasó aquí en su historia?', '¿Qué tiene de especial su arquitectura?'];

const MODE_LABEL = {
  generativo: 'Respuesta redactada con IA a partir de las fuentes',
  extractivo: 'Frases tomadas directamente de las fuentes',
  sin_resultados: 'Sin información en las fuentes',
};

export default function AskHistoryPanel({ place }) {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [openCite, setOpenCite] = useState(null);

  const send = async (text = question) => {
    const q = text.trim();
    if (q.length < QUESTION_MIN) {
      setError('Escribe una pregunta un poco más larga.');
      return;
    }
    setQuestion(q);
    setError(null);
    setLoading(true);
    setOpenCite(null);
    try {
      setResult(await askPlace(place.id, q));
    } catch (e) {
      setResult(null);
      setError(
        e.network
          ? 'El asistente necesita el servidor de Retazo. Verifica que el backend esté encendido y en la misma red.'
          : e.message || 'No fue posible obtener una respuesta.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.panel}>
      <View style={styles.header}>
        <Feather name="message-circle" size={16} color={C.amber} />
        <Text style={styles.title}>Pregúntale a la historia</Text>
      </View>
      <Text style={styles.subtitle}>Responde solo con la información de las fuentes de {place.nombre}.</Text>

      <View style={styles.suggestions}>
        {SUGGESTIONS.map((s) => (
          <TouchableOpacity key={s} style={styles.suggestion} onPress={() => send(s)} disabled={loading} accessibilityRole="button">
            <Text style={styles.suggestionText}>{s}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={[styles.inputRow, error && !result && styles.inputRowError]}>
        <TextInput
          value={question}
          onChangeText={(t) => { setQuestion(t); if (error) setError(null); }}
          placeholder="Escribe tu pregunta…"
          placeholderTextColor={C.brown}
          style={styles.input}
          maxLength={QUESTION_MAX}
          returnKeyType="send"
          onSubmitEditing={() => send()}
          editable={!loading}
          accessibilityLabel="Pregunta sobre el lugar"
        />
        <TouchableOpacity
          style={[styles.sendBtn, (loading || !question.trim()) && styles.sendBtnDisabled]}
          onPress={() => send()}
          disabled={loading || !question.trim()}
          accessibilityRole="button"
          accessibilityLabel="Enviar pregunta"
        >
          {loading ? <ActivityIndicator size="small" color={C.cream} /> : <Feather name="send" size={15} color={C.cream} />}
        </TouchableOpacity>
      </View>
      <Text style={styles.counter}>{question.length}/{QUESTION_MAX}</Text>

      {loading && <Text style={styles.loadingText}>Buscando en las fuentes…</Text>}
      {!!error && <NoticeBox icon="alert-triangle">{error}</NoticeBox>}

      {result && !loading && (
        <View style={styles.answer} accessibilityLiveRegion="polite">
          <Text style={styles.answerMode}>{MODE_LABEL[result.modo] ?? result.modo}</Text>
          <Text style={styles.answerText}>{result.respuesta}</Text>
          {!!result.aviso && <Text style={styles.answerNote}>{result.aviso}</Text>}

          {result.citas.length > 0 && (
            <View style={styles.cites}>
              <Text style={styles.citesLabel}>FUENTES CITADAS</Text>
              {result.citas.map((c) => {
                const open = openCite === c.n;
                return (
                  <View key={c.n} style={styles.cite}>
                    <TouchableOpacity style={styles.citeHead} onPress={() => setOpenCite(open ? null : c.n)} accessibilityRole="button">
                      <Text style={styles.citeNum}>[{c.n}]</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.citeTitle}>{c.fuente}</Text>
                        <Text style={styles.citeSection}>{c.seccion}</Text>
                      </View>
                      <Feather name={open ? 'chevron-up' : 'chevron-down'} size={14} color={C.brown} />
                    </TouchableOpacity>
                    {open && (
                      <>
                        <Text style={styles.citeFragment}>{c.fragmento}</Text>
                        {!!c.url && (
                          <TouchableOpacity onPress={() => Linking.openURL(c.url)} accessibilityRole="link">
                            <Text style={styles.citeLink}>Abrir fuente original ↗</Text>
                          </TouchableOpacity>
                        )}
                      </>
                    )}
                  </View>
                );
              })}
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: { backgroundColor: C.cream, borderWidth: 1, borderColor: C.border, borderRadius: 14, padding: 16, gap: 10 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { fontSize: 16, color: C.ink, fontFamily: F.serifSemi },
  subtitle: { fontSize: 12, color: C.brown, fontFamily: F.sans, lineHeight: 18 },
  suggestions: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  suggestion: { backgroundColor: C.sepia, borderRadius: RADIUS.pill, paddingHorizontal: 10, paddingVertical: 6 },
  suggestionText: { fontSize: 11, color: C.inkMid, fontFamily: F.sansMed },
  inputRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: C.parchment,
    borderWidth: 1.5, borderColor: C.border, borderRadius: RADIUS.lg, paddingLeft: 12, paddingRight: 6,
  },
  inputRowError: { borderColor: C.amber },
  input: { flex: 1, fontSize: 13.5, color: C.ink, fontFamily: F.sans, paddingVertical: 10, outlineStyle: 'none' },
  sendBtn: { backgroundColor: C.ink, borderRadius: 10, width: 34, height: 34, alignItems: 'center', justifyContent: 'center' },
  sendBtnDisabled: { opacity: 0.4 },
  counter: { fontSize: 10, color: C.brown, fontFamily: F.mono, textAlign: 'right', marginTop: -6 },
  loadingText: { fontSize: 12, color: C.brown, fontFamily: F.sans, fontStyle: 'italic' },
  answer: { gap: 8, borderTopWidth: 1, borderTopColor: C.border, paddingTop: 12 },
  answerMode: { fontSize: 10, color: C.amber, fontFamily: F.mono, letterSpacing: 0.6 },
  answerText: { fontSize: 13.5, color: C.ink, fontFamily: F.sans, lineHeight: 21 },
  answerNote: { fontSize: 11, color: C.brown, fontFamily: F.sans, fontStyle: 'italic' },
  cites: { gap: 6, marginTop: 4 },
  citesLabel: { fontSize: 10, color: C.brown, fontFamily: F.mono, letterSpacing: 1.1 },
  cite: { borderWidth: 1, borderColor: C.border, borderRadius: 10, padding: 10, gap: 6, backgroundColor: C.parchment },
  citeHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  citeNum: { fontSize: 12, color: C.amber, fontFamily: F.mono },
  citeTitle: { fontSize: 11.5, color: C.ink, fontFamily: F.sansSemi },
  citeSection: { fontSize: 10.5, color: C.brown, fontFamily: F.sans },
  citeFragment: { fontSize: 12, color: C.inkMid, fontFamily: F.sans, lineHeight: 18 },
  citeLink: { fontSize: 11.5, color: C.amber, fontFamily: F.sansMed },
});
