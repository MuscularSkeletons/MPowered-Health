// This screen groups saved pain assessments and displays recent pain trends.
import {
  getPainHistory,
  groupPainHistory,
  PainMetric,
} from '@/features/pain/services/pain-history';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

export function useHealthRecords() {
  const [tab, setTab] = useState<'chart' | 'history'>('chart');
  const [metric, setMetric] = useState<PainMetric>('Average');
  const [expanded, setExpanded] = useState(false);
  const [history, setHistory] = useState(getPainHistory);
  const [selectedKey, setSelectedKey] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  useFocusEffect(
    useCallback(() => {
      setHistory(getPainHistory());
    }, []),
  );
  // Keep the selected group when it exists, or use the first group.
  const groups = groupPainHistory(history);
  const selected = groups.find((group) => group.key === selectedKey) ?? groups[0];
  const records = selected?.records ?? [];
  const newestFirst = [...records].reverse();
  // Show recent records first and reveal older ones only on request.
  const rows = expanded ? newestFirst : newestFirst.slice(0, 4);
  return {
    tab,
    setTab,
    metric,
    setMetric,
    expanded,
    setExpanded,
    selectedKey,
    setSelectedKey,
    dropdownOpen,
    setDropdownOpen,
    groups,
    selected,
    records,
    rows,
    newestFirst,
  };
}
