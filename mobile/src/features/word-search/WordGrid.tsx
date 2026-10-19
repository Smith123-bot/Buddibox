import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { AppText } from '../../components/AppText';
import { colors, radius } from '../../design/tokens';
import { equalPoint, type Point, type Puzzle } from './puzzles';
import { isMarked, type WordSession } from './session';
export const WORD_CELL_DP=48;
export function WordGrid({puzzle,session,onCell}:{puzzle:Puzzle;session:WordSession;onCell:(point:Point)=>void}){
  return <ScrollView horizontal contentContainerStyle={styles.scroll} accessibilityLabel="Word grid, swipe horizontally to view all columns on narrow screens">
    <View style={[styles.board,{width:puzzle.size*WORD_CELL_DP}]}>{puzzle.grid.map((row,r)=><View key={r} style={styles.row}>{row.map((token,c)=>{
      const point={row:r,col:c},found=isMarked(session,puzzle,point),selected=!!session.selection&&equalPoint(session.selection,point),hint=!!session.hintId&&puzzle.targets.some(t=>t.id===session.hintId&&equalPoint(t.cells[0]!,point));
      return <Pressable key={c} accessibilityRole="button" accessibilityLabel={`Row ${r+1}, column ${c+1}, ${token}${found?', found word':''}${hint?', hint start':''}`} accessibilityState={{disabled:session.phase!=='playing',selected:selected||found}} disabled={session.phase!=='playing'} onPress={()=>onCell(point)} style={({pressed})=>[styles.cell,found&&styles.found,selected&&styles.selected,hint&&styles.hint,pressed&&styles.pressed]}>
        <AppText maxFontSizeMultiplier={1.4} style={styles.token}>{token}</AppText>{found&&<View style={styles.mark} accessible={false} />}
      </Pressable>;
    })}</View>)}</View>
  </ScrollView>;
}
const styles=StyleSheet.create({scroll:{flexGrow:1,justifyContent:'center'},board:{borderRadius:radius.small,overflow:'hidden',borderWidth:1,borderColor:colors.border},row:{flexDirection:'row'},cell:{width:WORD_CELL_DP,height:WORD_CELL_DP,alignItems:'center',justifyContent:'center',borderWidth:1,borderColor:colors.border,backgroundColor:colors.surface,position:'relative'},found:{backgroundColor:'#19483F'},selected:{backgroundColor:'#565194',borderColor:colors.primary,borderWidth:2},hint:{borderColor:colors.highlight,borderWidth:3},pressed:{opacity:0.7},token:{fontSize:20,lineHeight:32,color:colors.text,fontWeight:'600',textAlign:'center',includeFontPadding:true},mark:{position:'absolute',bottom:2,width:12,height:2,backgroundColor:colors.success}});
