import { useEffect, useMemo, useRef, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { KeyboardAvoidingView, Linking, PanResponder, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActionButton, MhaHeader, palette } from '@/components/mha-ui';
import { addPainRecord, getAssessmentAnswers, markAssessmentCompleted } from '@/constants/assessment-session';
type Q = {
  title: string;
  prompt: string;
  kind: 'multi' | 'single' | 'score' | 'number' | 'text';
  options?: string[];
  optional?: boolean;
  helper?: string;
};
const scales = {
  walk: ['Pain does not prevent me walking any distance', 'Pain prevents me from walking more than 2 kilometres', 'Pain prevents me from walking more than 1 kilometre', 'Pain prevents me from walking more than 500 metres', 'I can only walk using a stick or crutches', 'I am in bed most of the time'],
  lift: ['I can lift heavy weights without extra pain', 'I can lift heavy weights, but it causes extra pain', 'I struggle to lift heavy weights off the floor, but I can lift them from a table', 'I struggle to lift heavy weights off the floor, but I can lift medium weights from a table', 'I can lift only very light weights', 'I cannot lift or carry anything at all'],
  sit: ['I can sit in any chair as long as I like', 'I can only sit in my favourite chair as long as I like', 'Pain prevents me sitting more than one hour', 'Pain prevents me sitting more than 30 minutes', 'Pain prevents me from sitting more than 10 minutes', 'Pain prevents me from sitting at all'],
  stand: ['I can stand as long as I want without increased pain', 'I can stand as long as I want, but it increases my pain', 'Pain prevents me standing more than one hour', 'Pain prevents me standing more than 30 minutes', 'Pain prevents me from standing more than 10 minutes', 'Pain prevents me from standing at all']
};
const tipUrls: Record<string, string> = {
  movement: 'https://muscha.org/exercise',
  personal: 'https://muscha.org/living-well-with-a-musculoskeletal-condition',
  social: 'https://muscha.org/relaxation/',
  management: 'https://muscha.org/pain-guide/'
};
const specs: Record<string, {
  title: string;
  questions: Q[];
  tip: string;
  summary: string;
}> = {
  pain: {
    title: 'My Pain',
    tip: 'Check Pain Guide',
    summary: 'This helps guide your treatment and support your recovery.',
    questions: [{
      title: 'Pain location',
      prompt: 'I have had pain in these areas last week.',
      kind: 'multi',
      options: ['Head', 'Neck', 'Shoulder', 'Upper Back', 'Lower Back', 'Leg', 'Hip', 'Buttock', 'Knee', 'Other']
    }, {
      title: 'Pain characteristics',
      prompt: 'For each of the following words, select the adjectives that apply to your pain.',
      kind: 'multi',
      options: ['Aching', 'Throbbing', 'Shooting', 'Stabbing', 'Gnawing', 'Sharp', 'Tender', 'Burning', 'Exhausting', 'Tiring', 'Penetrating', 'Nagging', 'Numb', 'Miserable', 'Unbearable']
    }, {
      title: 'Pain intensity',
      prompt: 'My current pain is',
      kind: 'score'
    }, {
      title: 'Pain intensity',
      prompt: 'My mildest pain last week was',
      kind: 'score'
    }, {
      title: 'Pain intensity',
      prompt: 'My worst pain last week was',
      kind: 'score'
    }, {
      title: 'Pain intensity',
      prompt: 'My overall average pain last week was',
      kind: 'score'
    }]
  },
  movement: {
    title: 'My Movement',
    tip: 'Explore tips on managing movement',
    summary: 'Your answers indicate that pain is significantly impacting your movement. With the right support and treatment, your movement and mobility can improve.',
    questions: [{
      title: 'General Movement Impacts',
      prompt: 'On average, how many hours per day were you able to stay active or mobile last week?',
      kind: 'number',
      helper: 'Staying active could mean doing your typical activities, such as working, driving, doing household chores, or meeting with people.'
    }, {
      title: 'General Movement Impacts',
      prompt: 'Select ALL relevant statements:',
      kind: 'multi',
      options: ['I walk more slowly than usual because of my pain', 'I lie down to rest more often because of my pain', 'I only stand up for short periods of time because of my pain', 'I try not to bend or kneel down because of my pain', 'I find it difficult to get out of a chair because of my pain', 'I sit down most of the day because of my pain']
    }, {
      title: 'Walking Impacts',
      prompt: 'Select the MOST relevant statement:',
      kind: 'single',
      options: scales.walk
    }, {
      title: 'Lifting Impacts',
      prompt: 'Select the MOST relevant statement:',
      kind: 'single',
      options: scales.lift
    }, {
      title: 'Sitting Impacts',
      prompt: 'Select the MOST relevant statement:',
      kind: 'single',
      options: scales.sit
    }, {
      title: 'Standing Impacts',
      prompt: 'Select the MOST relevant statement:',
      kind: 'single',
      options: scales.stand
    }, {
      title: 'Reflection on your movement',
      prompt: 'Write any reflections of pain impacts on your mobility.',
      kind: 'text',
      optional: true,
      helper: 'For instance, when pain occurred, you may have needed to lie down for the whole day.'
    }]
  },
  personal: {
    title: 'My Personal Care',
    tip: 'Explore tips on daily living',
    summary: 'Pain is currently having a significant impact on your personal care. With the right care and guidance, these tasks can become more manageable over time.',
    questions: [{
      title: 'General Activities Impacts',
      prompt: 'Select ALL relevant statements:',
      kind: 'multi',
      options: ['I am not doing any jobs that I usually do around the house', 'I get dressed more slowly than usual because of my pain', 'I sleep less well because of my pain', 'I am more irritable and bad tempered with people than usual', 'I try to get other people to do things for me because of my pain']
    }, {
      title: 'Personal care (washing, dressing, etc.)',
      prompt: 'Select the MOST relevant statement:',
      kind: 'single',
      options: ['I can look after myself normally without causing extra pain', 'I can look after myself normally, but it causes extra pain', 'It is painful to look after myself and I am slow and careful', 'I need some help but manage most of my personal care', 'I need help every day with most aspects of self-care', 'I do not get dressed, wash with difficulty and stay in bed']
    }, {
      title: 'Sleeping',
      prompt: 'Select the MOST relevant statement:',
      kind: 'single',
      options: ['My sleep is never disturbed by pain', 'My sleep is occasionally disturbed by pain', 'Because of pain I have less than 6 hours of sleep', 'Because of pain I have less than 4 hours of sleep', 'Because of pain I have less than 2 hours of sleep', 'Pain prevents me from sleeping at all']
    }, {
      title: 'Reflection on your personal care',
      prompt: 'Write any reflections of pain impacts on your daily life.',
      kind: 'text',
      optional: true,
      helper: 'For instance, you may have felt unable to complete everyday tasks, such as doing the laundry.'
    }]
  },
  social: {
    title: 'My Social Health',
    tip: 'Explore tips on managing emotions',
    summary: 'Your answers indicate that pain limits your ability to enjoy social activities. With the right treatment and support, you can stay more active and connected.',
    questions: [{
      title: 'Social life',
      prompt: 'Select the MOST relevant statement:',
      kind: 'single',
      options: ['My social life is normal and gives me no extra pain', 'My social life is normal but increases the degree of pain', 'Pain has no significant effect on my social life apart from limiting my more energetic interests, such as gym or sports', 'Pain has restricted my social life and I do not go out as often', 'Pain has restricted my social life to my home', 'I have no social life because of pain']
    }, {
      title: 'Travelling',
      prompt: 'Select the MOST relevant statement:',
      kind: 'single',
      options: ['I can travel anywhere without pain', 'I can travel anywhere, but it gives me extra pain', 'Pain is bad, but I manage journeys over two hours', 'Pain restricts me to journeys of less than one hour', 'Pain restricts me to short necessary journeys under 30 minutes', 'Pain prevents me from travelling except to receive treatment']
    }, {
      title: 'Mood',
      prompt: 'Over the past week, how much has pain impacted your mood?',
      kind: 'score'
    }, {
      title: 'Relation with others',
      prompt: 'Over the past week, how much has pain interfered with your relationships with other people?',
      kind: 'score'
    }, {
      title: 'Enjoyment of life',
      prompt: 'Over the past week, how much has pain impacted your ability to enjoy life?',
      kind: 'score'
    }, {
      title: 'Mood',
      prompt: 'Over the past week, how was your mood generally?',
      kind: 'single',
      options: ['I was feeling frustrated', 'I was feeling sad', 'I was feeling okay', 'I was feeling calm', 'I was feeling delighted'],
      helper: 'Select the option that best describes your mood.'
    }, {
      title: 'Mood',
      prompt: 'What triggered that mood?',
      kind: 'text',
      optional: true,
      helper: 'For example: delays at work due to pain or being unable to meet with friends.'
    }]
  },
  management: {
    title: 'My Management',
    tip: 'Explore tips on managing pain',
    summary: 'You mainly perform exercises to manage your pain and consume Vitamin D3 daily.',
    questions: [{
      title: 'Medication',
      prompt: 'Over the past week, select medications that you consumed to manage your pain.',
      kind: 'multi',
      optional: true,
      helper: 'Not taking medications? You can continue without selecting an option. This list is generated from your medication records.',
      options: ['Perindopril arginine 5 mg — Once daily', 'Candesartan 16 mg — Once daily', 'Amlodipine 5 mg — Once daily', 'Vitamin D3 1000 IU — Once daily', 'Raloxifene 60 mg — Once daily']
    }, {
      title: 'Medication',
      prompt: 'Over the past week, did you take any over-the-counter (OTC) medication?',
      kind: 'text',
      optional: true,
      helper: 'Not taking OTC medication? You can continue without entering a medication.'
    }, {
      title: 'Exercise',
      prompt: 'In the past 7 days, did you perform any exercises to manage your musculoskeletal pain or improve your movement?',
      kind: 'single',
      helper: 'Examples include walking, stretching, strengthening, yoga, resistance-band work, or balance exercises.',
      options: ['0 days', '1–2 days', '3–4 days', '5–6 days', '7 days']
    }, {
      title: 'Emotion',
      prompt: 'Over the past week, did you perform any strategies to manage your stress level or emotion?',
      kind: 'text',
      optional: true,
      helper: 'Examples include meditation, journaling, or meeting with people.'
    }]
  }
};
const painLabel = (n: number) => n === 0 ? 'I have no pain at all' : n <= 3 ? 'The pain is very mild' : n <= 6 ? 'The pain is moderate' : n <= 8 ? 'The pain is fairly severe' : n === 9 ? 'The pain is extremely severe' : 'The pain is the worst imaginable';
const scoreImpact=(value:string,subject:string)=>{const n=Number(value);if(n===0)return `Pain does not impact my ${subject} at all.`;if(n<=3)return `Pain slightly affects my ${subject}.`;if(n<=6)return `Pain moderately affects my ${subject}.`;if(n<=8)return `Pain substantially impacts my ${subject}.`;return `Pain completely impacts my ${subject}.`};
const asSentence=(value:string)=>{
  if(!value||/[.!?]$/.test(value))return value;
  const isCompleteStatement=/^(I |My |Pain |Because |Are |What |Is |How |Would |Should |Even |There |It |Last week)/.test(value);
  return isCompleteStatement?`${value}.`:value;
};
function buildSummary(type:string,answers:Record<number,string[]>){const a=(i:number)=>answers[i]??[];if(type==='pain'){const painSentence=(value:string,kind:string)=>{const n=Number(value);const level=n<=3?'mild':n<=6?'moderate':n<=8?'severe':'very severe';return kind==='Current Pain'?(n===0?'I do not experience pain at the moment.':`I currently experience ${level} pain.`):kind==='Worst pain'?`My worst pain was ${level}.`:`I have experienced ${level} pain.`};return [{title:'Pain location',text:`I have pain in the following areas: ${a(0).join(', ')}`},{title:'Pain characteristics',text:`Words describing my pain: ${a(1).join(', ').toLowerCase()}`},{title:`Current pain: ${a(2)[0]??0}`,text:painSentence(a(2)[0]??'0','Current Pain')},{title:`Mildest pain: ${a(3)[0]??0}`,text:painSentence(a(3)[0]??'0','Mildest pain')},{title:`Worst pain: ${a(4)[0]??0}`,text:painSentence(a(4)[0]??'0','Worst pain')},{title:`Average pain: ${a(5)[0]??0}`,text:painSentence(a(5)[0]??'0','Average pain')}];}if(type==='movement')return [{title:'Average activity hours:',text:`Last week, I was able to stay active for approximately ${a(0)[0]??0} hours.`},{title:'General movement:',text:a(1).join(' and ')},{title:'Walking:',text:a(2)[0]??''},{title:'Lifting:',text:a(3)[0]??''},{title:'Sitting:',text:a(4)[0]??''},{title:'Standing:',text:a(5)[0]??''},{title:'My reflections:',text:a(6)[0]??''}];if(type==='personal')return [{title:'General activities:',text:a(0).join(', ')},{title:'Personal care (washing, dressing, etc.):',text:a(1)[0]??''},{title:'Sleeping:',text:a(2)[0]??''},{title:'My reflections:',text:a(3)[0]??''}];if(type==='social')return [{title:'Social life:',text:a(0)[0]??''},{title:'Travelling:',text:a(1)[0]??''},{title:'Mood:',text:scoreImpact(a(2)[0]??'0','mood')},{title:'Relation with others:',text:scoreImpact(a(3)[0]??'0','relationships with others')},{title:'Enjoyment of life:',text:scoreImpact(a(4)[0]??'0','ability to enjoy life')},{title:'My reflections on mood:',text:a(6)[0]??a(5)[0]??''}];return [{title:'Medication:',text:a(0).length?`You only consumed ${a(0).join(', ')} this week.`:'You did not record any medication this week.'},{title:'Exercise:',text:a(2)[0]?`You exercised for ${a(2)[0]} this week.`:'No exercise was recorded this week.'},{title:'Emotion:',text:a(3)[0]||'You did not perform any dedicated strategy to manage your mood.'}];}

function PainSummaryResults({answers}:{answers:Record<number,string[]>}) {
  const value=(index:number)=>answers[index]?.[0]??'0';
  const statement=(index:number,kind:'current'|'mildest'|'worst'|'average')=>{
    const score=Number(value(index));
    if(score===0)return kind==='current'?'I do not experience pain at the moment.':'I had no pain at all.';
    const level=score<=3?'mild':score<=6?'moderate':score<=8?'severe':'very severe';
    if(kind==='current')return `I currently experience ${level} pain.`;
    if(kind==='worst')return `My worst pain was ${level}.`;
    return `I have experienced ${level} pain.`;
  };
  const intensity=[
    {label:'Current pain',index:2,kind:'current' as const},
    {label:'Mildest pain',index:3,kind:'mildest' as const},
    {label:'Worst pain',index:4,kind:'worst' as const},
    {label:'Average pain',index:5,kind:'average' as const},
  ];
  return <>
    <View style={[s.painSection,s.painSectionFirst]}><Text style={s.painSectionTitle}>Pain location</Text><Text style={s.result}>I have pain in the following areas:</Text><Text style={s.resultValue}>{answers[0]?.join('\n')||'No location recorded.'}</Text></View>
    <View style={s.painSection}><Text style={s.painSectionTitle}>Pain characteristics</Text><Text style={s.result}>My pain was: {answers[1]?.join(', ').toLowerCase()||'not recorded'}.</Text></View>
    <View style={s.painSection}><Text style={s.painSectionTitle}>Pain intensity</Text>{intensity.map(item=><View key={item.label} style={s.intensityItem}><Text style={s.intensityLabel}>{item.label}: {value(item.index)}</Text><Text style={s.result}>{statement(item.index,item.kind)}</Text></View>)}</View>
  </>;
}

function SummaryInsight({summary,tip,url}:{summary:string;tip:string;url:string}) {
  return <View style={s.summaryInsight}>
    <View style={s.summaryStatement}><Text style={s.summaryStatementText}>{summary}</Text></View>
    <Pressable accessibilityRole="link" style={({pressed})=>[s.guideButton,pressed&&s.guidePressed]} onPress={()=>Linking.openURL(url)}>
      <Text style={s.guideIcon}>⌕</Text><Text style={s.guideText}>{tip}</Text><Text style={s.guideArrow}>›</Text>
    </Pressable>
  </View>;
}
function ScoreSlider({value,onChange}:{value:number;onChange:(value:number)=>void}) {
  const trackRef=useRef<View>(null);
  const metrics=useRef({left:0,width:1,ready:false});
  const lastValue=useRef(value); lastValue.current=value;
  const onChangeRef=useRef(onChange); onChangeRef.current=onChange;
  const update=(pageX:number)=>{if(!metrics.current.ready)return;const next=Math.max(0,Math.min(10,Math.round((pageX-metrics.current.left)/metrics.current.width*10)));if(next!==lastValue.current){lastValue.current=next;onChangeRef.current(next)}};
  const measure=(pageX?:number)=>trackRef.current?.measureInWindow((left,_top,width)=>{metrics.current={left,width:Math.max(width,1),ready:true};if(pageX!=null)update(pageX)});
  const pan=useRef(PanResponder.create({onStartShouldSetPanResponder:()=>true,onMoveShouldSetPanResponder:()=>true,onPanResponderGrant:e=>measure(e.nativeEvent.pageX),onPanResponderMove:e=>update(e.nativeEvent.pageX),onPanResponderTerminationRequest:()=>false})).current;
  return <View style={s.sliderArea}><View ref={trackRef} collapsable={false} onLayout={()=>measure()} {...pan.panHandlers} style={s.sliderTrack}><View pointerEvents="none" style={[s.sliderFill,{width:`${value*10}%`}]}/><View pointerEvents="none" style={[s.sliderThumb,{left:`${value*10}%`}]}><View style={s.sliderBubble}><Text style={s.sliderBubbleText}>{value}</Text></View></View></View><View style={s.sliderEnds}><Text style={s.sliderEnd}>0</Text><Text style={s.sliderEnd}>10</Text></View></View>
}
export default function Assessment() {
  const {
    type = 'pain', completed = '', name = 'Jane'
  } = useLocalSearchParams<{
    type: string;
    completed?: string;
    name?: string;
  }>();
  const spec = specs[type] ?? specs.pain;
  const [step, setStep] = useState(0),
    [answers, setAnswers] = useState<Record<number, string[]>>({}),
    [done, setDone] = useState(false);
  const scrollRef=useRef<ScrollView>(null);

  // Expo Router can retain this screen while only changing its route params.
  // Every assessment must therefore start with its own clean recording state.
  useEffect(() => {
    const savedAnswers=getAssessmentAnswers(type);
    setStep(0);
    setAnswers(savedAnswers??{});
    setDone(Boolean(savedAnswers));
  }, [type]);
  useEffect(() => {
    scrollRef.current?.scrollTo({y:0,animated:false});
  }, [step,type]);
  const activeStep = Math.min(step, spec.questions.length - 1),
    q = spec.questions[activeStep],
    current = answers[activeStep] ?? [];
  const valid = q.optional || current.length > 0;
  const select = (v: string) => setAnswers(a => ({
    ...a,
    [activeStep]: q.kind === 'multi' ? current.includes(v) ? current.filter(x => x !== v) : [...current, v] : [v]
  }));
  const next = () => {
    if (activeStep < spec.questions.length - 1) {
      setStep(activeStep + 1);
      return;
    }
    markAssessmentCompleted(type,answers);
    if(type==='pain')addPainRecord(Number(answers[5]?.[0]??answers[2]?.[0]??0));
    setDone(true);
  };
  const result = useMemo(() => Object.values(answers).flat(), [answers]);
  const summarySections=buildSummary(type,answers).filter(section=>section.text).map(section=>({...section,text:asSentence(section.text)}));
  const closeSummary=()=>{const all=[...new Set([...completed.split(',').filter(Boolean),type])].join(',');router.replace({pathname:'/dashboard',params:{completed:all,name}})};
  if (done) return <SafeAreaView style={s.safe} edges={['top']}><MhaHeader /><ScrollView contentContainerStyle={s.summary}><Text style={s.summaryTitle}>{spec.title} Summary</Text><Text style={s.summaryCopy}>{type==='pain'?spec.summary:'Your answers help your doctor focus on what matters most to your daily life.'}</Text><View style={s.resultCard}><View style={s.summaryMeta}><Text style={[s.resultHeading,{marginBottom:0,lineHeight:20}]}>{spec.title}</Text><Text style={s.period}>Period: 18–24 May</Text></View>{type!=='pain'?<SummaryInsight summary={spec.summary} tip={spec.tip} url={tipUrls[type]}/>:null}{type!=='pain'?<Text style={[s.resultHeading,s.headingDivider]}>My results:</Text>:null}{type==='pain'?<PainSummaryResults answers={answers}/>:summarySections.map((section,i)=><View key={i} style={s.resultSection}><Text style={section.title.startsWith('My reflections')?[s.resultHeading,s.headingDivider]:s.resultLabel}>{section.title}</Text><Text style={s.result}>{section.text}</Text></View>)}{!result.length ? <Text style={s.result}>No items recorded this week.</Text> : null}</View><View style={s.summaryFooter}><Text style={s.saved}>{type==='pain'?'Saved to My Health':'Saved to Care Journal'}</Text><Pressable accessibilityRole="button" onPress={closeSummary} style={({pressed})=>[s.closeButton,pressed&&s.closePressed]}><Text style={s.closeText}>Close</Text></Pressable></View></ScrollView></SafeAreaView>;
  return <SafeAreaView style={s.safe} edges={['top']}><MhaHeader /><KeyboardAvoidingView style={{
      flex: 1
    }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}><ScrollView ref={scrollRef} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled"><View style={s.top}><Pressable onPress={() => activeStep ? setStep(activeStep - 1) : router.replace({pathname:'/dashboard',params:{completed,name}})}><Text style={s.back}>‹  Back</Text></Pressable><Text style={s.counter}>{activeStep + 1}/{spec.questions.length}</Text></View><View style={s.track}><View style={[s.fill, {
            width: `${(activeStep + 1) / spec.questions.length * 100}%`
          }]} /></View><Text style={s.module}>{spec.title}</Text><Text style={s.title}>{q.title}</Text><Text style={s.prompt}>{q.prompt}</Text>{q.kind === 'score' ? <><View style={s.score}><Text style={s.scoreNumber}>{current[0] ?? '0 to 10'}</Text><Text style={s.scoreLabel}>{current.length ? painLabel(Number(current[0])) : 'Slide to select a value'}</Text></View><ScoreSlider value={Number(current[0]??0)} onChange={n=>select(String(n))}/></> : q.kind === 'text' || q.kind === 'number' ? <TextInput value={current[0] ?? ''} onChangeText={select} keyboardType={q.kind === 'number' ? 'numeric' : 'default'} multiline={q.kind === 'text'} placeholder={q.kind === 'number' ? 'input number only' : 'Write your reflection'} placeholderTextColor="#81798A" style={[s.input, q.kind === 'text' && {
          minHeight: 150
        }]} /> : <View style={s.options}>{q.options?.map(o => {
            const on = current.includes(o);
            return <Pressable key={o} onPress={() => select(o)} style={[s.option, on && s.optionOn]}><Text style={[s.optionText, on && s.optionTextOn]}>{asSentence(o)}</Text><View style={[q.kind === 'single' ? s.radio : s.box, on && s.markOn]}><Text style={s.tick}>{on ? '✓' : ''}</Text></View></Pressable>;
          })}</View>}<View style={s.action}><ActionButton label={activeStep === spec.questions.length - 1 ? 'Review' : 'Record'} disabled={!valid} onPress={next} />{!valid ? <Text style={s.required}>This question is mandatory.</Text> : null}</View>{q.helper?<Text style={s.helper}>{q.helper}</Text>:null}</ScrollView></KeyboardAvoidingView></SafeAreaView>;
}
const s = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: palette.background
  },
  content: {
    width:'100%',maxWidth:680,alignSelf:'center',
    paddingHorizontal:24,paddingTop:20,
    paddingBottom: 120
  },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  back: {
    fontSize: 14,
    fontWeight: '700',
    color: palette.primary,
    paddingVertical: 12
  },
  counter: {
    fontSize: 12,
    fontWeight: '700',
    color: palette.muted
  },
  track: {
    height: 5,
    borderRadius: 4,
    backgroundColor: '#E9E3EC',
    overflow: 'hidden',
    marginTop: 8,
    marginBottom: 26
  },
  fill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: palette.secondary
  },
  module: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.1,
    color: palette.primary,
    textTransform: 'uppercase'
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800',
    letterSpacing: -.6,
    color: palette.text,
    marginTop: 8
  },
  prompt: {
    fontSize: 15,
    lineHeight: 22,
    color: palette.muted,
    marginTop: 9
  },
  helper:{fontSize:12,lineHeight:18,color:palette.muted,marginTop:14,paddingHorizontal:14,paddingVertical:12,backgroundColor:palette.surfaceSoft,borderRadius:12},
  options: {
    gap: 12,
    marginTop: 24
  },
  option: {
    minHeight: 64,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: palette.line,
    backgroundColor: '#fff',
    paddingHorizontal: 18,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center'
  },
  optionOn: {
    backgroundColor: '#F3EEFF',
    borderColor: '#BEA1F7'
  },
  optionText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: palette.text,
    paddingRight: 10
  },
  optionTextOn: {
    fontWeight: '700',
    color: palette.primaryDark
  },
  box: {
    width: 24,
    height: 24,
    borderWidth: 1.5,
    borderColor: '#B9AFC8',
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center'
  },
  radio: {
    width: 24,
    height: 24,
    borderWidth: 1.5,
    borderColor: '#B9AFC8',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  markOn: {
    backgroundColor: palette.primary,
    borderColor: palette.primary
  },
  tick: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800'
  },
  score: {
    backgroundColor: '#F7F4FC',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    marginTop: 26
  },
  scoreNumber: {
    fontSize: 38,
    fontWeight: '800',
    color: palette.primaryDark
  },
  scoreLabel: {
    fontSize: 13,
    color: palette.muted,
    marginTop: 7
  },
  sliderArea:{marginTop:28,marginBottom:12},
  sliderTrack:{height:30,borderRadius:15,backgroundColor:'#D8C7FA',justifyContent:'center'},
  sliderFill:{position:'absolute',left:0,height:18,borderRadius:9,backgroundColor:'#5E17EB'},
  sliderThumb:{position:'absolute',marginLeft:-10,width:20,height:42,borderRadius:6,backgroundColor:'#5E17EB',alignItems:'center'},
  sliderBubble:{position:'absolute',top:-40,minWidth:42,height:34,borderRadius:7,backgroundColor:'#5E17EB',alignItems:'center',justifyContent:'center'},
  sliderBubbleText:{fontSize:16,fontWeight:'800',color:'#fff'},
  sliderEnds:{flexDirection:'row',justifyContent:'space-between',marginTop:9},
  sliderEnd:{fontSize:11,fontWeight:'700',color:palette.muted},
  numbers: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginTop: 20
  },
  number: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: palette.line,
    alignItems: 'center',
    justifyContent: 'center'
  },
  numberOn: {
    backgroundColor: palette.primary,
    borderColor: palette.primary
  },
  numberText: {
    fontSize: 14,
    fontWeight: '700',
    color: palette.text
  },
  numberTextOn: {
    color: '#fff'
  },
  input: {
    minHeight: 58,
    borderWidth: 1,
    borderColor: palette.line,
    borderRadius: 18,
    backgroundColor: '#fff',
    padding: 16,
    fontSize: 15,
    color: palette.text,
    textAlignVertical: 'top',
    marginTop: 24
  },
  action: {
    marginTop: 28
  },
  required: {
    fontSize: 12,
    fontWeight: '400',
    color: palette.text,
    textAlign: 'center',
    marginTop: 10
  },
  summary: {
    width:'100%',maxWidth:680,alignSelf:'center',paddingHorizontal:24,paddingTop:24,
    paddingBottom: 110
  },
  period: {
    fontSize: 12,
    lineHeight: 20,
    fontWeight: '700',
    color: palette.primary
  },
  summaryTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: palette.text,
    marginTop: 8
  },
  summaryCopy: {
    fontSize: 15,
    lineHeight: 22,
    color: palette.muted,
    marginTop: 8
  },
  resultCard: {
    backgroundColor: palette.surface,
    borderRadius: 22,
    padding: 20,
    marginVertical: 24
  },
  summaryMeta:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',paddingBottom:14,marginBottom:8,borderBottomWidth:1,borderBottomColor:palette.line},
  resultSection:{paddingVertical:10},
  resultLabel:{fontSize:13,fontWeight:'800',color:palette.text,marginBottom:5},
  painSection:{paddingTop:18,paddingBottom:16,borderTopWidth:1,borderTopColor:palette.line},
  painSectionFirst:{borderTopWidth:0,paddingTop:8},
  painSectionTitle:{fontSize:16,lineHeight:21,fontWeight:'800',letterSpacing:-.2,color:palette.primaryDark,marginBottom:10},
  resultValue:{fontSize:13,lineHeight:20,color:palette.text,fontWeight:'600',marginTop:5},
  intensityItem:{paddingTop:10,paddingLeft:12,borderLeftWidth:2,borderLeftColor:palette.accent,marginTop:2},
  intensityLabel:{fontSize:13,lineHeight:19,fontWeight:'700',color:palette.text,marginBottom:2},
  summaryStatement:{backgroundColor:'#F3EEFF',paddingHorizontal:18,paddingVertical:22},
  summaryInsight:{marginBottom:20,borderRadius:16,borderWidth:1,borderColor:palette.accent,overflow:'hidden'},
  summaryStatementText:{fontSize:14,lineHeight:21,fontWeight:'600',color:palette.text,textAlign:'center'},
  guideButton:{minHeight:54,backgroundColor:palette.light,borderTopWidth:1,borderTopColor:palette.accent,paddingHorizontal:16,flexDirection:'row',alignItems:'center',justifyContent:'center',gap:10},
  guidePressed:{backgroundColor:palette.accent},
  guideIcon:{fontSize:19,fontWeight:'800',color:palette.primary},
  guideText:{fontSize:13,fontWeight:'800',color:palette.primaryDark},
  guideArrow:{fontSize:22,color:palette.primary},
  summaryFooter:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:16},
  closeButton:{minWidth:96,minHeight:42,borderRadius:21,borderWidth:1,borderColor:palette.line,backgroundColor:'#fff',alignItems:'center',justifyContent:'center',paddingHorizontal:20},
  closePressed:{backgroundColor:'#F2EDFA'},
  closeText:{fontSize:13,fontWeight:'800',color:palette.text},
  resultHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: palette.text,
    marginBottom: 10
  },
  headingDivider:{paddingBottom:10,borderBottomWidth:1,borderBottomColor:palette.line},
  result: {
    fontSize: 13,
    lineHeight: 20,
    color: palette.text,
    marginBottom: 5
  },
  saved: {
    fontSize: 12,
    fontWeight: '700',
    color: '#27705A',
    textAlign: 'left',
    marginBottom: 0,
    flex:1
  }
});
