import React , {useRef, useState, useEffect} from 'react';
import {Text, View, TextInput, TouchableOpacity, ScrollView, StyleSheet} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import CalendarPicker from 'react-native-calendar-picker';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import Icon from 'react-native-vector-icons/Ionicons';
import { format, addDays, subDays, addMonths, addYears } from 'date-fns';
import { CheckBox } from 'react-native-elements';
import { onChildAdded, ref, update, push, off, get, remove } from 'firebase/database';
import { db } from '../firebaseConfig';


export default function App(){
    
    const [date, setDate] = useState(new Date())
    const [endDate, setEndDate] = useState(new Date())
    const [description, setDescription] = useState('')
    const [title, setTitle] = useState('')
    const [repeat, setRepeat] = useState('none')

    const [isVisible, setVisible] = useState(false);
    const calendarRef = useRef(null);

    const [checklist, setChecklist] = useState([]);

    const repeatOptions = [
        { label: '반복 안함', value: 'none' },
        { label: '매달', value: 'month' },
        { label: '매년', value: 'year' }
    ];

    var container = {flex:1, paddingTop:7};
    var input_st = {borderRadius:6, backgroundColor:"#FFFFFF", borderColor:"grey", borderWidth:0.5, paddingVertical:5, paddingHorizontal:10, flex:1};
    var row_st = {flexDirection:'row', alignItems:'center', justifyContent:'center', marginHorizontal:10};
    var scrollContainer = {flexGrow: 1, padding:15}
    var footer = {backgroundColor: '#f8f8f8', padding: 10, borderTopWidth: 1, borderColor: '#e0e0e0'}
    var button = {backgroundColor: 'black', padding: 9.5, borderRadius: 6, alignItems: 'center', width: 75}
    var buttonText = {color: 'white'}

    useFocusEffect( React.useCallback(() => {
        // 화면이 포커스될 때 실행할 코드
        console.log('월별 체크리스트 화면이 포커스됨');
        const today = new Date();
        onDateChange(today)
    }, []))   

    async function onDateChange(d:Date){
        console.log(d);
        setChecklist([]);
        if(endDate<d) setEndDate(d);
        console.log("날짜 선택: ", format(d, "yyyy/MM/dd"))

        const prevDateRef = ref(db, "ChecklistByDate/"+format(date,"yyyy-MM"));
        off(prevDateRef);
        setDate(d)

        const Dateref = ref(db, "ChecklistByDate/"+format(d,"yyyy-MM"));

        onChildAdded(Dateref,  (data) => {
            console.log(data.val().ToDoKey)
            var TodoRef = ref(db, "ToDoList/"+data.val().ToDoKey)
            get(TodoRef).then((data2)=>{
                if(data2.val()==null) {
                    remove(ref(db, "ChecklistByDate/"+format(d,"yyyy-MM")+"/"+data.key));
                    return;
                }
                // 체크리스트에 항목 추가
                setChecklist((prevChecklist) =>
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
    }

    // 체크박스 상태 변경 핸들러
    const handleToggle = (id, done) => {
        update(ref(db, "ChecklistByDate/"+format(date,"yyyy-MM")+"/"+id), {Done: !done})
        setChecklist((prevChecklist) =>
            prevChecklist.map((item) =>
                item.id === id ? { ...item, done: !item.done } : item
            )
        );
    }

    // 체크리스트에서 삭제
    const deleteFromList = (id, todokey) => {
        remove(ref(db, "ToDoList/"+todokey))
        setChecklist((prevChecklist) => prevChecklist.filter(item => item.id != id))
    }

    return(
        <View style={container}>
            <CalendarPicker 
                ref={calendarRef}
                onMonthChange={onDateChange}
                todayBackgroundColor="#D3D3D3"
                selectedDayColor="black"
                selectedDayTextColor="#FFFFFF"
                startFromMonday="true"
                showDayStragglers="true"
                selectMonthTitle="원하는 달을 선택하세요  "
                selectYearTitle=" 년도를 선택하세요"
                yearTitleStyle={{fontWeight: 'bold'}}
                monthTitleStyle={{fontWeight: 'bold'}}
                previousTitle={<Icon name='caret-back-circle-outline' size={24} color='black'/>}
                nextTitle={<Icon name='caret-forward-circle-outline' size={24} color='black'/>}
                weekdays={["월", "화", "수", "목", "금", "토", "일"]}
                months={[
                    "1월",
                    "2월",
                    "3월",
                    "4월",
                    "5월",
                    "6월",
                    "7월",
                    "8월",
                    "9월",
                    "10월",
                    "11월",
                    "12월",
                ]}
            />
            <ScrollView contentContainerStyle={scrollContainer}>
                {checklist.map((item) => (
                    <View>
                    <View key={item.id} style={styles.checkBoxContainer}>
                        <CheckBox
                            checked={item.done}
                            onPress={() => handleToggle(item.id, item.done)}
                            title={
                                <Text style={[styles.titleText, item.done && styles.completed]}>
                                {item.title}
                                </Text>
                            }
                            uncheckedIcon={<Icon name='square-outline' size={18} color='gray'/>} 
                            checkedIcon={<Icon name='checkbox' size={18} color='gray'/>}
                            containerStyle={styles.checkbox}
                            checkedColor="gray"
                        />
                        <TouchableOpacity style={{marginLeft: 'auto', paddingRight:10}} onPress={()=> deleteFromList(item.id, item.todokey)}>
                            <Icon name='trash' size={20} color='gray'/>
                        </TouchableOpacity>
                    </View>
                    {item.desc && <Text style={[styles.descText, item.done && styles.completed]}>{item.desc}</Text>}
                    <View style={{padding:6}}/>
                    </View>
                ))}
            </ScrollView>
            <View style={footer}>
                <View style={row_st}>
                    <TextInput style={input_st} placeholder='할 일 입력' value={title} onChangeText={setTitle}/>
                    <View style={{padding:5}}/>
                    <TouchableOpacity style={button} onPress={save}>
                        <Text style={buttonText}>추가하기</Text>
                    </TouchableOpacity>
                </View>
                <View style={{padding:4}}/>
                <View style={row_st}>
                    <TextInput
                        style={input_st}
                        placeholder="설명 입력 (선택 사항)"
                        value={description}
                        onChangeText={setDescription}
                        multiline={true} // 여러 줄 입력 가능
                        numberOfLines={4} // 기본 줄 수 설정
                        textAlignVertical="top" // 텍스트가 위쪽에 정렬되도록 설정
                    />
                    <View style={{paddingLeft:10}}>
                    {repeatOptions.map((option) => (
                        <View>
                        <TouchableOpacity
                            key={option.value}
                            style={styles.radioContainer}
                            onPress={() => setRepeat(option.value)}
                        >
                        <View style={styles.radioCircle}>
                            {repeat === option.value && <View style={styles.checkedCircle} />}
                        </View>
                        <Text style={styles.radioText}>{option.label}</Text>
                        </TouchableOpacity>
                        <View style={{padding:3}}/>
                        </View>
                    ))}
                    </View>
                </View>
                <View style={{padding:5}}/>
                <View style={row_st}>
                    <Text>반복 설정:  </Text>
                    <TouchableOpacity
                        activeOpacity={1}
                        onPress={() => setVisible(true)}
                        style={{flex:1, flexDirection:'row', alignItems:'center', borderColor:"black", borderWidth:1, margin:2, paddingHorizontal:7}}>
                        <Icon name="calendar" size={20} color="black"/>
                        <TextInput 
                            style={{color:'black'}}
                            defaultValue={"  "+format(endDate,"yyyy/MM/dd")}
                            editable={false} // optional
                        />
                    </TouchableOpacity>
                    <DateTimePickerModal
                        isVisible={isVisible}
                        onConfirm={(date) => {
                            setVisible(false); // <- first thing
                            setEndDate(date);
                        }}
                        onCancel={() => setVisible(false)}
                        date={endDate}
                        minimumDate={date}
                    />
                    <Text>  까지 </Text>
                </View>
            </View>
        </View>
    )
    
    async function save(){
        if(title=='') return;
        console.log("-----------추가-----------")
        console.log("할일: "+title)
        console.log("설명: "+description)

        const TodoRef = ref(db, "ToDoList/");
        var newTodoRef = push(TodoRef, {
            Title: title.trim(),
            Description: description.trim()
        })

        console.log("날짜:")
        if(repeat=='none'){
            const DateRef = ref(db, "ChecklistByDate/" + format(date, "yyyy-MM"));
            push(DateRef,{
                ToDoKey: newTodoRef.key,
                Done: false
            })
            console.log(format(date, "  yyyy-MM-dd"))
        } else if(repeat=='month'){
            for(var d = date; d<=endDate; d=addMonths(d,1)){
                const DateRef = ref(db, "ChecklistByDate/" + format(d, "yyyy-MM"));
                push(DateRef,{
                    ToDoKey: newTodoRef.key,
                    Done: false
                })
                console.log(format(d, " yyyy-MM-dd"))
            }
        } else if(repeat=='year'){
            for(var d = date; d<=endDate; d=addYears(d,1)){
                const DateRef = ref(db, "ChecklistByDate/" + format(d, "yyyy-MM"));
                push(DateRef,{
                    ToDoKey: newTodoRef.key,
                    Done: false
                })
                console.log(format(d, " yyyy-MM-dd"))
            }
        }
        console.log("-------------------------")

        setTitle('')
        setDescription('')
    }
}

const styles = StyleSheet.create({
    radioContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 0, // 라디오 버튼 간격 조정
    },
    radioCircle: {
      height: 16, // 버튼 크기 조정
      width: 16,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: 'grey',
      backgroundColor: '#eee',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 2, // 라디오 버튼과 텍스트 간의 간격 조정
    },
    checkedCircle: {
        height: 11, // 내부 원 크기
        width: 11,
        borderRadius: 5.5, // 원형
        backgroundColor: 'black', // 선택된 상태의 색상
      },
    selectedRadio: {
        borderColor: '#000',
        backgroundColor: '#000',
    },
    radioText: {
        marginLeft: 5,
    },
    title: {
        fontSize: 24,
        marginBottom: 20,
    },
    checkBoxContainer: {
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
        fontSize: 16,
    },
    descText: {
        color: 'grey',
        marginLeft: 35
    },
    completed: {
        textDecorationLine: 'line-through', // 취소선 추가
        color: 'gray', // 선택된 항목의 색상 변경
    }
  });