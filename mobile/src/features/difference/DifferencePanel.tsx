import { useState } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '../../components/AppText';
import { colors, radius, spacing } from '../../design/tokens';
import type { Level } from './levels';
import { mapTouch } from './logic';
type Props = { level:Level; side:0|1; found:readonly string[]; hintId:string|null; onGuess:(x:number,y:number)=>void; enabled:boolean };
export function DifferencePanel({level,side,found,hintId,onGuess,enabled}:Props){
  const [size,setSize]=useState({width:0,height:0});
  return <View style={styles.wrap}><AppText variant="eyebrow" style={styles.caption}>{side===0?'IMAGE A':'IMAGE B'}</AppText>
    <Pressable accessibilityRole="imagebutton" accessibilityLabel={`${level.title}, image ${side===0?'A':'B'}. Tap a difference.`} disabled={!enabled} accessibilityState={{disabled:!enabled}} onLayout={event=>setSize(event.nativeEvent.layout)} onPress={event=>{
      const {locationX,locationY}=event.nativeEvent;
      const p=mapTouch(locationX,locationY,size.width,size.height,1.5);if(p)onGuess(p.x,p.y);
    }} style={styles.panel}>
      <Image source={level.images[side]} resizeMode="contain" style={styles.image} />
      {level.regions.filter(r=>found.includes(r.id)||hintId===r.id).map(r=><View key={r.id} pointerEvents="none" style={[styles.marker,{left:`${(r.x-r.rx)*100}%`,top:`${(r.y-r.ry)*100}%`,width:`${r.rx*200}%`,height:`${r.ry*200}%`,borderColor:found.includes(r.id)?colors.success:colors.highlight,borderStyle:found.includes(r.id)?'solid':'dashed'}]}><AppText style={styles.markerText}>{found.includes(r.id)?'✓':'?'}</AppText></View>)}
    </Pressable>
  </View>;
}
const styles=StyleSheet.create({wrap:{gap:spacing.sm},caption:{color:colors.secondary},panel:{width:'100%',aspectRatio:1.5,borderRadius:radius.medium,overflow:'hidden',borderWidth:1,borderColor:colors.border,backgroundColor:colors.surface},image:{width:'100%',height:'100%'},marker:{position:'absolute',borderWidth:3,borderRadius:999,alignItems:'center',justifyContent:'center',backgroundColor:'#191B3055'},markerText:{fontSize:18,color:colors.text,fontWeight:'900'}});
