import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from '../../components/AppText';
import { colors, radius } from '../../design/tokens';
import { EAST, NORTH, SOUTH, WEST, equal } from './engine';
import type { MazeLevel } from './levels';
import type { MazeSession } from './session';
export function mazeCellSize(width:number,cols:number){return Number.isFinite(width)&&width>0&&Number.isInteger(cols)&&cols>0?Math.floor(Math.min(width,480)/cols):0}
export function MazeBoard({level,session}:{level:MazeLevel;session:MazeSession}){
  const [width,setWidth]=useState(0);const size=mazeCellSize(width,level.cols);
  const maze=level.maze;
  return <View style={styles.frame} onLayout={e=>setWidth(e.nativeEvent.layout.width)} accessible accessibilityRole="image" accessibilityLabel={`Maze board: ${level.rows} rows and ${level.cols} columns. Player row ${session.position.row+1}, column ${session.position.col+1}. Exit row ${maze.exit.row+1}, column ${maze.exit.col+1}.`}>
    {size>0&&<View style={{width:size*level.cols,height:size*level.rows,flexDirection:'row',flexWrap:'wrap'}}>{maze.cells.map((bits,index)=>{
      const p={row:Math.floor(index/level.cols),col:index%level.cols};
      const player=equal(p,session.position),exit=equal(p,maze.exit),start=equal(p,maze.start),hint=!!session.hintCell&&equal(p,session.hintCell);
      const visited=session.visited.includes(index);
      return <View key={index} style={{width:size,height:size,borderTopWidth:bits&NORTH?0:3,borderRightWidth:bits&EAST?0:3,borderBottomWidth:bits&SOUTH?0:3,borderLeftWidth:bits&WEST?0:3,borderColor:colors.primary,backgroundColor:hint?'#57506D':visited?colors.surfaceRaised:colors.surface,alignItems:'center',justifyContent:'center'}}>
        {player?<View style={[styles.player,{width:Math.max(14,size*0.55),height:Math.max(14,size*0.55),borderRadius:Math.max(7,size*0.28)}]} />:exit?<AppText style={[styles.symbol,{fontSize:Math.max(13,size*0.48)}]}>◆</AppText>:hint?<AppText style={styles.hint}>●</AppText>:start?<AppText style={styles.start}>S</AppText>:null}
      </View>;
    })}</View>}
  </View>;
}
const styles=StyleSheet.create({frame:{width:'100%',alignItems:'center',justifyContent:'center',borderRadius:radius.medium,overflow:'hidden'},player:{backgroundColor:colors.highlight,borderWidth:2,borderColor:colors.background},symbol:{color:colors.success,fontWeight:'900'},hint:{color:colors.highlight},start:{color:colors.muted,fontWeight:'700'}});
