
interface MobileControllerProps {
    roomCode?: string
}

export default function MobileController(props: MobileControllerProps) {
    return (
        <>
            <div className="text-xl">
                {props.roomCode}
            </div>
        </>
    );
}