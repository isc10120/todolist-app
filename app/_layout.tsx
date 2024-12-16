import { Drawer } from "expo-router/drawer";

export default function RootLayout() {
  return (
  <Drawer>
    <Drawer.Screen name="index" options={{title: 'To Do List'}}/>
    <Drawer.Screen name="daylist" options={{title: '일별 체크리스트'}}/>
    <Drawer.Screen name="weeklist" options={{title: '주별 체크리스트'}}/>
    <Drawer.Screen name="monthlist" options={{title: '월별 체크리스트'}}/>
  </Drawer>
  );
}
