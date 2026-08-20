import { useEffect, useRef, useState } from 'react';
import { Dimensions, FlatList, Pressable, StyleSheet, Text, View, ViewToken } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MhaHeader, palette } from '@/components/mha-ui';
import { SplashArtwork } from '@/components/splash-artwork';

const pages=[
  {title:'Track your pain and its impacts weekly'},
  {title:'Easily share your pain logs to your healthcare professionals'},
  {title:'Get tailored questions to assist your medical consultation'},
];

export default function Splash(){
  const[index,setIndex]=useState(0);
  const currentIndex=useRef(0);
  const ref=useRef<FlatList<(typeof pages)[number]>>(null);
  const width=Dimensions.get('window').width;
  const changed=useRef(({viewableItems}:{viewableItems:ViewToken<(typeof pages)[number]>[]})=>{
    if(viewableItems[0]?.index!=null){currentIndex.current=viewableItems[0].index;setIndex(viewableItems[0].index)}
  }).current;
  useEffect(()=>{const timer=setInterval(()=>{const next=(currentIndex.current+1)%pages.length;currentIndex.current=next;ref.current?.scrollToIndex({index:next,animated:true})},1900);return()=>clearInterval(timer)},[]);
  return <SafeAreaView style={s.safe}>
    <MhaHeader/>
    <FlatList ref={ref} horizontal pagingEnabled bounces={false} decelerationRate="fast" showsHorizontalScrollIndicator={false} data={pages} keyExtractor={x=>x.title} getItemLayout={(_,i)=>({length:width,offset:width*i,index:i})} onViewableItemsChanged={changed} renderItem={({item,index:page})=><View style={[s.page,{width}]}><View style={s.art}><SplashArtwork page={page}/></View><View style={s.dots}>{pages.map((_,i)=><Pressable accessibilityLabel={`Show splash page ${i+1}`} key={i} onPress={()=>ref.current?.scrollToIndex({index:i,animated:true})} style={[s.dot,i===index&&s.dotOn]}/>)}</View><Text style={s.message}>{item.title}</Text></View>}/>
    <View style={s.actions}><Pressable style={({pressed})=>[s.primary,pressed&&s.primaryPressed]} onPress={()=>router.replace({pathname:'/workflow',params:{flow:'onboarding'}})}><Text style={s.primaryText}>Get started  →</Text></Pressable><Pressable style={({pressed})=>[s.secondary,pressed&&s.secondaryPressed]} onPress={()=>router.replace('/login')}><Text style={s.secondaryText}>Sign in</Text></Pressable></View>
    <Text style={s.sponsor}>Supported by ABBVIE</Text>
  </SafeAreaView>
}

const s=StyleSheet.create({
  safe:{flex:1,backgroundColor:'#fff'},
  page:{paddingHorizontal:24},
  art:{height:294,alignItems:'center',justifyContent:'flex-start',overflow:'hidden'},
  message:{width:'100%',maxWidth:520,alignSelf:'center',minHeight:104,fontSize:28,lineHeight:35,fontWeight:'800',letterSpacing:-.65,color:palette.text,paddingHorizontal:18,marginBottom:8},
  dots:{width:'100%',maxWidth:520,height:48,alignSelf:'center',paddingHorizontal:18,flexDirection:'row',alignItems:'center',justifyContent:'flex-start',gap:8},
  dot:{width:12,height:12,borderRadius:6,backgroundColor:'#D8CFE5'},
  dotOn:{width:34,height:12,borderRadius:6,backgroundColor:'#5E17EB'},
  actions:{width:'100%',maxWidth:520,alignSelf:'center',paddingHorizontal:30,gap:6},
  primary:{height:50,borderRadius:9,backgroundColor:'#5E17EB',alignItems:'center',justifyContent:'center'},
  primaryPressed:{backgroundColor:'#4610B8',transform:[{scale:.99}]},
  primaryText:{fontSize:14,fontWeight:'800',color:'#fff'},
  secondary:{height:40,alignItems:'center',justifyContent:'center'},
  secondaryPressed:{backgroundColor:'#F3EEFF',borderRadius:12},
  secondaryText:{fontSize:13,fontWeight:'700',textDecorationLine:'underline',color:'#201A2B'},
  sponsor:{fontSize:10,fontWeight:'500',color:'#686173',textAlign:'center',paddingTop:8,paddingBottom:14},
});
