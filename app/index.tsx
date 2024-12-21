import React , {useRef, useState, useEffect} from 'react';
import {Text, View, TextInput, TouchableOpacity, ScrollView, StyleSheet} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import Icon from 'react-native-vector-icons/Ionicons';
import { format, addDays, subDays, startOfWeek, endOfWeek } from 'date-fns';
import { CheckBox } from 'react-native-elements';
import { onChildAdded, ref, update, off, get, remove } from 'firebase/database';
import { db } from '../firebaseConfig';

let weekStart = new Date();
let weekEnd = new Date();

export default function App(){
  const [date, setDate] = useState(new Date());
  const [daylist, setDaylist] = useState([]);
  const [weeklist, setWeeklist] = useState([]);
  const [monthlist, setMonthlist] = useState([]);

  const [isVisible, setVisible] = useState(false);
  const [showDate, setShowDate] = useState('오늘');

  const today = new Date();

  useFocusEffect( React.useCallback(() => {
    // 화면이 포커스될 때 실행할 코드
    console.log('To Do List 화면이 포커스됨');
    onDateChange(date)
  }, []))

  // 체크박스 상태 변경 핸들러들
  const DayHandleToggle = (id, done) => {
      update(ref(db, "ChecklistByDate/"+format(date,"yyyy-MM-dd")+"/"+id), {Done: !done})
      setDaylist((prevlist) =>
          prevlist.map((item) =>
              item.id === id ? { ...item, done: !item.done } : item
          )
      );
  }
  const WeekHandleToggle = (id, done) => {
    update(ref(db, "ChecklistByDate/"+format(weekStart,"yyyy-MM-dd")+" ~ "+format(weekEnd,"yyyy-MM-dd")+"/"+id), {Done: !done})
    setWeeklist((prevlist) =>
        prevlist.map((item) =>
            item.id === id ? { ...item, done: !item.done } : item
        )
    );
  }
  const MonthHandleToggle = (id, done) => {
    update(ref(db, "ChecklistByDate/"+format(date,"yyyy-MM")+"/"+id), {Done: !done})
    setMonthlist((prevlist) =>
        prevlist.map((item) =>
            item.id === id ? { ...item, done: !item.done } : item
        )
    );
  }

  // 체크리스트에서 삭제
  const deleteFromDList = (id, todokey) => {
    remove(ref(db, "ToDoList/"+todokey))
    setDaylist((prevChecklist) => prevChecklist.filter(item => item.id != id))
  }
  const deleteFromWList = (id, todokey) => {
      remove(ref(db, "ToDoList/"+todokey))
      setWeeklist((prevChecklist) => prevChecklist.filter(item => item.id != id))
  }
  const deleteFromMList = (id, todokey) => {
    remove(ref(db, "ToDoList/"+todokey))
    setMonthlist((prevChecklist) => prevChecklist.filter(item => item.id != id))
  }

  return(
  <View>
    <ScrollView>
      <View style={{flexDirection:'row'}}>
        <View style={styles.title}>
          <TouchableOpacity onPress={()=>onDateChange(subDays(date,1))}>
            <Icon name='caret-back-circle-outline' size={20} color='black'/>
          </TouchableOpacity>
          <View style={{padding:4}}/>
          <TouchableOpacity
            style={{flexDirection:'row', alignItems:'center'}}
            activeOpacity={1}
            onPress={() => setVisible(true)}>
            <Text style={{fontSize:17, fontWeight:'500'}}> {showDate} </Text>
            <Icon name="calendar-number" size={17}/>
          </TouchableOpacity>
          <DateTimePickerModal
              isVisible={isVisible}
              onConfirm={(d) => {
                  setVisible(false); // <- first thing
                  onDateChange(d)
              }}
              onCancel={() => setVisible(false)}
              date={date}
          />
          <View style={{padding:5}}/>
          <TouchableOpacity onPress={()=>onDateChange(addDays(date,1))}>
            <Icon name='caret-forward-circle-outline' size={20} color='black'/>
          </TouchableOpacity>
        </View>
      </View>
      <View style={{padding:1}}/>
      {daylist.map((item) => (
          <View>
          <View key={item.id} style={styles.checkBoxContainer}>
              <CheckBox
                  checked={item.done}
                  onPress={() => DayHandleToggle(item.id, item.done)}
                  title={
                      <Text style={[styles.titleText, item.done && styles.completed]}>
                      {item.title}
                      </Text>
                  }
                  uncheckedIcon={<Icon name='square-outline' size={25} color='gray'/>} 
                  checkedIcon={<Icon name='checkbox' size={25} color='gray'/>}
                  containerStyle={styles.checkbox}
                  checkedColor="gray"
              />
              <TouchableOpacity style={{marginLeft: 'auto', paddingRight:10}} onPress={()=> deleteFromDList(item.id, item.todokey)}>
                  <Icon name='trash' size={25} color='gray'/>
              </TouchableOpacity>
          </View>
          <View style={{padding:2}}/>
          {item.desc && <Text style={[styles.descText, item.done && styles.completed]}>{item.desc}</Text>}
          <View style={{padding:5}}/>
          </View>
      ))}
      <View style={{flexDirection:'row'}}>
        <View style={styles.title}>
          <Text style={{fontSize:15, fontWeight:'500'}}> 이번 주 </Text>
        </View>
      </View>
      <View style={{padding:1}}/>
      {weeklist.map((item) => (
          <View>
          <View key={item.id} style={styles.checkBoxContainer}>
              <CheckBox
                  checked={item.done}
                  onPress={() => WeekHandleToggle(item.id, item.done)}
                  title={
                      <Text style={[styles.titleText, item.done && styles.completed]}>
                      {item.title}
                      </Text>
                  }
                  uncheckedIcon={<Icon name='square-outline' size={25} color='gray'/>} 
                  checkedIcon={<Icon name='checkbox' size={25} color='gray'/>}
                  containerStyle={styles.checkbox}
                  checkedColor="gray"
              />
              <TouchableOpacity style={{marginLeft: 'auto', paddingRight:10}} onPress={()=> deleteFromWList(item.id, item.todokey)}>
                  <Icon name='trash' size={25} color='gray'/>
              </TouchableOpacity>
          </View>
          <View style={{padding:2}}/>
          {item.desc && <Text style={[styles.descText, item.done && styles.completed]}>{item.desc}</Text>}
          <View style={{padding:5}}/>
          </View>
      ))}
      <View style={{flexDirection:'row'}}>
        <View style={styles.title}>
          <Text style={{fontSize:15, fontWeight:'500'}}> 이번 달 </Text>
        </View>
      </View>
      <View style={{padding:1}}/>
      {monthlist.map((item) => (
          <View>
          <View key={item.id} style={styles.checkBoxContainer}>
              <CheckBox
                  checked={item.done}
                  onPress={() => MonthHandleToggle(item.id, item.done)}
                  title={
                      <Text style={[styles.titleText, item.done && styles.completed]}>
                      {item.title}
                      </Text>
                  }
                  uncheckedIcon={<Icon name='square-outline' size={25} color='gray'/>} 
                  checkedIcon={<Icon name='checkbox' size={25} color='gray'/>}
                  containerStyle={styles.checkbox}
                  checkedColor="gray"
              />
              <TouchableOpacity style={{marginLeft: 'auto', paddingRight:10}} onPress={()=> deleteFromMList(item.id, item.todokey)}>
                  <Icon name='trash' size={25} color='gray'/>
              </TouchableOpacity>
          </View>
          <View style={{padding:2}}/>
          {item.desc && <Text style={[styles.descText, item.done && styles.completed]}>{item.desc}</Text>}
          <View style={{padding:5}}/>
          </View>
      ))}
    </ScrollView>
  </View>
  )

  async function onDateChange(d:Date){
    var dstring = format(d,'yyyy/MM/dd')
    if(dstring==format(new Date(),'yyyy/MM/dd')) setShowDate('오늘')
    else if(dstring==format(addDays(new Date(), 1),'yyyy/MM/dd')) setShowDate('내일')
    else if(dstring==format(subDays(new Date(), 1),'yyyy/MM/dd')) setShowDate('어제')
    else setShowDate(dstring)

    setDaylist([]);
    console.log("날짜 선택: ", format(d, "yyyy/MM/dd"))

    const prevDateRef = ref(db, "ChecklistByDate/"+format(date,"yyyy-MM-dd"));
    off(prevDateRef);
    const prevMonthRef = ref(db, "ChecklistByDate/"+format(date,"yyyy-MM"));
    off(prevMonthRef);
    
    setDate(d)

    const Dateref = ref(db, "ChecklistByDate/"+format(d,"yyyy-MM-dd"));
    onChildAdded(Dateref,  (data) => {
        console.log(data.val().ToDoKey)
        var TodoRef = ref(db, "ToDoList/"+data.val().ToDoKey)
        get(TodoRef).then((data2)=>{
            if(data2.val()==null) {
                remove(ref(db, "ChecklistByDate/"+format(d,"yyyy-MM-dd")+"/"+data.key));
                return;
            }
            // 체크리스트에 항목 추가
            setDaylist((prevlist) =>
                [...prevlist, 
                    {
                        id: data.key, 
                        title: data2.val().Title, 
                        desc: data2.val().Description,
                        done: data.val().Done,
                        todokey: data2.key
                    }
                ]
            );
        })
    })

    // 주간 체크리스트 가져오기
    const prevWeekRef = ref(db, "ChecklistByDate/"+format(weekStart,"yyyy-MM-dd")+" ~ "+format(weekEnd,"yyyy-MM-dd"));
    off(prevWeekRef);
    
    weekStart = startOfWeek(d, { weekStartsOn: 1 })
    weekEnd = endOfWeek(d, { weekStartsOn: 1 })
    console.log(weekStart.toDateString()+" ~ "+weekEnd.toDateString())

    setWeeklist([]);

    const WeekRef = ref(db, "ChecklistByDate/"+format(weekStart,"yyyy-MM-dd")+" ~ "+format(weekEnd,"yyyy-MM-dd"));

    onChildAdded(WeekRef,  (data) => {
        console.log(data.val().ToDoKey)
        var TodoRef = ref(db, "ToDoList/"+data.val().ToDoKey)
        get(TodoRef).then((data2)=>{
            if(data2.val()==null) {
                remove(ref(db, "ChecklistByDate/"+format(weekStart,"yyyy-MM-dd")+" ~ "+format(weekEnd,"yyyy-MM-dd")+"/"+data.key));
                return;
            }
            // 체크리스트에 항목 추가
            setWeeklist((prevChecklist) =>
                [...prevChecklist, 
                    {
                        id: data.key, 
                        title: data2.val().Title, 
                        desc: data2.val().Description,
                        done: data.val().Done,
                        todokey: data2.key
                    }
                ]
            );
        })
    })

    // 월간 체크리스트 가져오기
    setMonthlist([]);

    const MonthRef = ref(db, "ChecklistByDate/"+format(d,"yyyy-MM"));
    onChildAdded(MonthRef,  (data) => {
        console.log(data.val().ToDoKey)
        var TodoRef = ref(db, "ToDoList/"+data.val().ToDoKey)
        get(TodoRef).then((data2)=>{
            if(data2.val()==null) {
                remove(ref(db, "ChecklistByDate/"+format(d,"yyyy-MM")+"/"+data.key));
                return;
            }
            // 체크리스트에 항목 추가
            setMonthlist((prevlist) =>
                [...prevlist, 
                    {
                        id: data.key, 
                        title: data2.val().Title, 
                        desc: data2.val().Description,
                        done: data.val().Done,
                        todokey: data2.key
                    }
                ]
            );
        })
    })
}


}

const styles = StyleSheet.create({
  title: {borderBottomWidth:1, borderColor:'grey', flexDirection:'row', alignItems:'center', margin:15},
  checkBoxContainer: {
      marginHorizontal: 5,
      flexDirection: 'row',
      alignItems: 'center',
  },
  checkbox: {
      padding:0,
      margin:0,
      color: 'grey',
      backgroundColor: 'transparent', // 체크박스 배경 투명
      borderWidth: 0
  },
  titleText: {
      paddingLeft: 5,
      fontSize: 22,
  },
  descText: {
      fontSize: 18,
      color: 'grey',
      marginLeft: 50
  },
  completed: {
      textDecorationLine: 'line-through', // 취소선 추가
      color: 'gray', // 선택된 항목의 색상 변경
  }
});