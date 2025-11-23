import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lamp,
  Thermometer,
  Tv,
  Fan,
  DoorOpen,
  Camera,
  Shield,
  Speaker,
  Plug,
  Flame,
  Droplets,
  Sun,
  Moon,
  Power,
  Wifi,
  Battery,
  Gauge,
  Home,
  Search,
  Settings,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const energyData = [
  { t: "00:00", kwh: 0.4 },
  { t: "03:00", kwh: 0.35 },
  { t: "06:00", kwh: 0.6 },
  { t: "09:00", kwh: 1.1 },
  { t: "12:00", kwh: 0.9 },
  { t: "15:00", kwh: 1.2 },
  { t: "18:00", kwh: 1.6 },
  { t: "21:00", kwh: 1.0 },
];

const iconMap: Record<string, React.ReactNode> = {
  light: <Lamp className="size-4" />,
  climate: <Thermometer className="size-4" />,
  media: <Tv className="size-4" />,
  fan: <Fan className="size-4" />,
  door: <DoorOpen className="size-4" />,
  camera: <Camera className="size-4" />,
  security: <Shield className="size-4" />,
  speaker: <Speaker className="size-4" />,
  plug: <Plug className="size-4" />,
  water: <Droplets className="size-4" />,
  heat: <Flame className="size-4" />,
};

type DeviceType =
  | "light"
  | "climate"
  | "media"
  | "fan"
  | "door"
  | "camera"
  | "security"
  | "speaker"
  | "plug"
  | "water"
  | "heat";

type Device = {
  id: string;
  name: string;
  type: DeviceType;
  on?: boolean;
  value?: number;
  battery?: number;
  signal?: number;
};

type Room = {
  id: string;
  name: string;
  floor: number;
  occupied?: boolean;
  devices: Device[];
};

const initialRooms: Room[] = [
  {
    id: "living",
    name: "Living Room",
    floor: 1,
    occupied: true,
    devices: [
      { id: "lr1", name: "Ceiling Lights", type: "light", on: true, value: 68 },
      { id: "lr2", name: "Floor Lamp", type: "light", on: false, value: 0 },
      { id: "lr3", name: "Thermostat", type: "climate", value: 22 },
      { id: "lr4", name: "TV", type: "media", on: false },
      { id: "lr5", name: "Speaker", type: "speaker", on: true, value: 35 },
    ],
  },
  {
    id: "kitchen",
    name: "Kitchen",
    floor: 1,
    occupied: false,
    devices: [
      { id: "k1", name: "Spots", type: "light", on: true, value: 50 },
      { id: "k2", name: "Extractor", type: "fan", on: false, value: 0 },
      { id: "k3", name: "Leak Sensor", type: "water", on: true, battery: 88, signal: 92 },
      { id: "k4", name: "Oven", type: "heat", on: false },
    ],
  },
  {
    id: "bed",
    name: "Bedroom",
    floor: 2,
    occupied: false,
    devices: [
      { id: "b1", name: "Pendant", type: "light", on: false, value: 0 },
      { id: "b2", name: "Bedside Lamp", type: "light", on: true, value: 24 },
      { id: "b3", name: "Thermostat", type: "climate", value: 19 },
      { id: "b4", name: "Air Purifier", type: "fan", on: true, value: 60 },
    ],
  },
  {
    id: "entry",
    name: "Entry",
    floor: 1,
    occupied: false,
    devices: [
      { id: "e1", name: "Door Lock", type: "door", on: true },
      { id: "e2", name: "Cam", type: "camera", on: true, signal: 75 },
      { id: "e3", name: "Alarm", type: "security", on: false },
    ],
  },
  {
    id: "kids",
    name: "Kids room",
    floor: 2,
    occupied: false,
    devices: [
      { id: "kr1", name: "Ceiling Light", type: "light", on: false, value: 0 },
      { id: "kr2", name: "Night Light", type: "light", on: true, value: 15 },
      { id: "kr3", name: "Thermostat", type: "climate", value: 21 },
      { id: "kr4", name: "Ceiling Fan", type: "fan", on: false, value: 0 },
      { id: "kr5", name: "Smart Speaker", type: "speaker", on: false, value: 20 },
    ],
  },
];

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs text-muted-foreground">
      {children}
    </span>
  );
}

function DeviceIcon({ type }: { type: DeviceType }) {
  return <span className="text-muted-foreground">{iconMap[type]}</span>;
}

function DeviceCard({ device, onChange }: { device: Device; onChange: (d: Device) => void }) {
  const isDimmable = device.type === "light" || device.type === "speaker" || device.type === "fan";
  const isTemp = device.type === "climate";

  return (
    <Card className="group rounded-2xl border-muted/40 bg-card/60 shadow-sm transition hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <div className={`grid size-8 place-items-center rounded-xl border ${device.on ? "bg-muted/50" : "bg-transparent"}`}>
            <DeviceIcon type={device.type} />
          </div>
          <CardTitle className="text-base font-medium">{device.name}</CardTitle>
        </div>
        <div className="flex items-center gap-2">
          {typeof device.battery === "number" && (
            <Pill>
              <Battery className="size-3" /> {device.battery}%
            </Pill>
          )}
          {typeof device.signal === "number" && (
            <Pill>
              <Wifi className="size-3" /> {device.signal}%
            </Pill>
          )}
          <Switch
            checked={!!device.on}
            onCheckedChange={(checked) => onChange({ ...device, on: checked })}
            aria-label={`Toggle ${device.name}`}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {isDimmable && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Intensity</span>
              <span>{device.value ?? 0}%</span>
            </div>
            <Slider
              value={[device.value ?? 0]}
              onValueChange={([v]) => onChange({ ...device, value: v })}
              max={100}
              step={1}
            />
          </div>
        )}
        {isTemp && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Set point</span>
              <span>{device.value ?? 20}°C</span>
            </div>
            <Slider
              value={[device.value ?? 20]}
              onValueChange={([v]) => onChange({ ...device, value: v })}
              min={16}
              max={26}
              step={0.5}
            />
          </div>
        )}
        <div className="flex items-center gap-2">
          <Badge variant={device.on ? "default" : "secondary"} className="rounded-full">
            {device.on ? "On" : "Off"}
          </Badge>
          <Badge variant="outline" className="rounded-full">
            {device.type}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}

function RoomsSidebar({
  rooms,
  current,
  onSelect,
}: {
  rooms: Room[];
  current: string;
  onSelect: (id: string) => void;
}) {
  return (
    <aside className="w-full max-w-[260px] shrink-0 space-y-3 p-3">
      <div className="flex items-center gap-2 px-2">
        <Home className="size-4" />
        <span className="text-sm font-medium text-muted-foreground">Your Home</span>
      </div>
      <div className="rounded-2xl border bg-card/60 p-2">
        {rooms.map((r) => {
          const active = r.id === current;
          return (
            <button
              key={r.id}
              onClick={() => onSelect(r.id)}
              className={`group flex w-full items-center justify-between rounded-xl px-3 py-2 text-left transition ${
                active ? "bg-muted" : "hover:bg-muted/60"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`size-2 rounded-full ${r.occupied ? "bg-emerald-500" : "bg-amber-500"}`} />
                <div>
                  <div className="text-sm font-medium">{r.name}</div>
                  <div className="text-[11px] text-muted-foreground">Floor {r.floor}</div>
                </div>
              </div>
              <ChevronRight className="size-4 opacity-40 group-hover:opacity-70" />
            </button>
          );
        })}
      </div>
    </aside>
  );
}

function HeaderBar({
  filter,
  setFilter,
  allOff,
  setScene,
}: {
  filter: string;
  setFilter: (s: string) => void;
  allOff: () => void;
  setScene: (s: "Home" | "Away" | "Night") => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 p-3">
      <div className="flex min-w-64 flex-1 items-center gap-2 rounded-2xl border bg-card/60 px-3 py-2">
        <Search className="size-4 text-muted-foreground" />
        <Input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Search devices or rooms…"
          className="border-0 shadow-none focus-visible:ring-0"
        />
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" className="rounded-full" onClick={allOff}>
          <Power className="mr-2 size-4" /> All Off
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="rounded-full" variant="secondary">
              Scenes
              <ChevronDown className="ml-2 size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Quick Scenes</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setScene("Home")}>
              <Sun className="mr-2 size-4" /> Home
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setScene("Night")}>
              <Moon className="mr-2 size-4" /> Night
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setScene("Away")}>
              <Shield className="mr-2 size-4" /> Away
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button variant="ghost" className="rounded-full">
          <Settings className="size-4" />
        </Button>
      </div>
    </div>
  );
}

function RoomOverview({ room, onDeviceChange }: { room: Room; onDeviceChange: (d: Device) => void }) {
  const activeDevices = room.devices.filter((d) => d.on).length;

  return (
    <div className="grid gap-3 md:grid-cols-5">
      <Card className="md:col-span-2 rounded-2xl border-muted/40">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{room.name}</span>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Gauge className="size-4" /> {activeDevices}/{room.devices.length} active
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div className="rounded-xl border p-3">
              <div className="text-xs text-muted-foreground">Occupancy</div>
              <div className="mt-1 flex items-center gap-2">
                <div className={`size-2 rounded-full ${room.occupied ? "bg-emerald-500" : "bg-amber-500"}`} />
                {room.occupied ? "Someone home" : "Vacant"}
              </div>
            </div>
            <div className="rounded-xl border p-3">
              <div className="text-xs text-muted-foreground">Comfort</div>
              <div className="mt-1">{room.devices.find((d) => d.type === "climate")?.value ?? 21}°C</div>
            </div>
            <div className="rounded-xl border p-3">
              <div className="text-xs text-muted-foreground">Security</div>
              <div className="mt-1">{room.id === "entry" ? "Perimeter" : "Normal"}</div>
            </div>
          </div>

          <div className="rounded-xl border p-3">
            <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>Energy (today)</span>
              <span>kWh</span>
            </div>
            <div className="h-28">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={energyData} margin={{ left: 0, right: 0, top: 5, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="t" hide />
                  <YAxis hide />
                  <Tooltip />
                  <Line type="monotone" dataKey="kwh" dot={false} strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="md:col-span-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <AnimatePresence initial={false}>
            {room.devices.map((d) => (
              <motion.div
                key={d.id}
                layout
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
              >
                <DeviceCard device={d} onChange={onDeviceChange} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default function SmartHomePrototype() {
  const [rooms, setRooms] = useState<Room[]>(initialRooms);
  const [currentRoomId, setCurrentRoomId] = useState<string>(rooms[0].id);
  const [filter, setFilter] = useState("");

  const currentRoom = useMemo(() => rooms.find((r) => r.id === currentRoomId)!, [rooms, currentRoomId]);

  const filteredRooms = useMemo(() => {
    const q = filter.toLowerCase().trim();
    if (!q) return rooms;
    return rooms
      .map((r) => ({
        ...r,
        devices: r.devices.filter((d) => r.name.toLowerCase().includes(q) || d.name.toLowerCase().includes(q) || d.type.includes(q as DeviceType)),
      }))
      .filter((r) => r.devices.length > 0 || r.name.toLowerCase().includes(q));
  }, [rooms, filter]);

  function updateDevice(updated: Device) {
    setRooms((prev) =>
      prev.map((room) => ({
        ...room,
        devices: room.devices.map((d) => (d.id === updated.id ? updated : d)),
      }))
    );
  }

  function allOff() {
    setRooms((prev) => prev.map((r) => ({ ...r, devices: r.devices.map((d) => ({ ...d, on: false })) })));
  }

  function setScene(scene: "Home" | "Away" | "Night") {
    setRooms((prev) =>
      prev.map((r) => ({
        ...r,
        devices: r.devices.map((d) => {
          if (scene === "Away") {
            if (d.type === "security" || d.type === "camera" || d.type === "door") return { ...d, on: true };
            if (d.type === "light" || d.type === "speaker" || d.type === "media" || d.type === "fan") return { ...d, on: false, value: 0 };
          }
          if (scene === "Night") {
            if (d.type === "light") return { ...d, on: true, value: Math.min(30, d.value ?? 30) };
            if (d.type === "media" || d.type === "speaker") return { ...d, on: false, value: 0 };
          }
          if (scene === "Home") {
            if (d.type === "light") return { ...d, on: true, value: Math.max(50, d.value ?? 50) };
          }
          return d;
        }),
      }))
    );
  }

  return (
    <div className="mx-auto max-w-7xl p-3">
      <div className="grid gap-3 md:grid-cols-[260px_1fr]">
        <RoomsSidebar rooms={filteredRooms} current={currentRoomId} onSelect={setCurrentRoomId} />

        <main className="space-y-3">
          <HeaderBar filter={filter} setFilter={setFilter} allOff={allOff} setScene={setScene} />

          <Tabs defaultValue="overview" className="rounded-2xl border bg-card/60 p-2">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="devices">All Devices</TabsTrigger>
              <TabsTrigger value="insights">Insights</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="p-2">
              <RoomOverview room={currentRoom} onDeviceChange={updateDevice} />
            </TabsContent>
            <TabsContent value="devices" className="p-2">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {rooms.flatMap((r) => r.devices.map((d) => ({ ...d, room: r.name }))).map((d) => (
                  <Card key={d.id} className="rounded-2xl">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <div className="flex items-center gap-2">
                        <div className="grid size-8 place-items-center rounded-xl border">
                          <DeviceIcon type={d.type as DeviceType} />
                        </div>
                        <CardTitle className="text-base font-medium">{d.name}</CardTitle>
                      </div>
                      <Switch checked={!!d.on} onCheckedChange={(checked) => updateDevice({ ...(d as Device), on: checked })} />
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{d.room}</span>
                        <span>
                          {d.type === "climate" ? `${d.value ?? 20}°C` : typeof d.value === "number" ? `${d.value}%` : d.on ? "On" : "Off"}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="insights" className="p-2">
              <div className="grid gap-3 md:grid-cols-2">
                <Card className="rounded-2xl">
                  <CardHeader>
                    <CardTitle>Energy (today)</CardTitle>
                  </CardHeader>
                  <CardContent className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={energyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="t" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="kwh" dot={false} strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="rounded-2xl">
                  <CardHeader>
                    <CardTitle>Health</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-2 text-sm">
                    <div className="rounded-xl border p-3">
                      <div className="text-xs text-muted-foreground">Online Devices</div>
                      <div className="mt-1 text-2xl font-semibold">
                        {rooms.flatMap((r) => r.devices).filter((d) => d.on).length}
                      </div>
                    </div>
                    <div className="rounded-xl border p-3">
                      <div className="text-xs text-muted-foreground">Battery Avg</div>
                      <div className="mt-1 text-2xl font-semibold">
                        {Math.round(
                          (rooms
                            .flatMap((r) => r.devices)
                            .filter((d) => typeof d.battery === "number")
                            .reduce((sum, d) => sum + (d.battery || 0), 0) /
                            Math.max(1, rooms.flatMap((r) => r.devices).filter((d) => typeof d.battery === "number").length)) || 0
                        )}
                        %
                      </div>
                    </div>
                    <div className="col-span-2 rounded-xl border p-3">
                      <div className="mb-1 text-xs text-muted-foreground">Notes</div>
                      <ul className="list-disc space-y-1 pl-5 text-xs text-muted-foreground">
                        <li>Use Scenes to quickly set mood or security posture.</li>
                        <li>Search can find both rooms and specific devices.</li>
                        <li>All data here is mocked for prototype purposes.</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}