
interface MobileControllerProps {
    roomCode?: string
}

export default function MobileController(props: MobileControllerProps) {
    return (
        <>
            {props.roomCode}
        </>
    );
}