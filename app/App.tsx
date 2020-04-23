import 'normalize.css'
import '@blueprintjs/core/lib/css/blueprint.css'
import './blueprint.scss'
// import '@blueprintjs/icons/lib/css/blueprint-icons.css'
import './app.css'
import dynamic from 'next/dynamic'
import { Workspace } from './Workspaces'
import { Provider, useSelector, useDispatch } from 'react-redux'
import { getStore } from './store'
import { RadixProvider, Flex, Box } from '@modulz/radix'
import { EditorState } from './types'
import { useEffect } from 'react'
import { undo } from '../lib/undo-redux'
import Toolbar from './Toolbar/index'
import PropertyToolBar from './PropertyToolBar'
import { DndProvider } from 'react-dnd'
import HTML5Backend from 'react-dnd-html5-backend'
import { Explorer2 } from './Explorer'
import { cancelCreating, deleteNode, waitingForCreating } from './appShell'
import { TitledBoard } from '../inspector/FormComponents'
import { MouldMetas } from './MouldMetas'
import { MouldScope } from './MouldScope'
import { MouldStates } from './MouldStates'
import { MouldKits } from './MouldKits'
import { ArcherContainer } from 'react-archer'
import { MouldInput } from './MouldInput'
import DebugPanel from './DebugPanel'
import nanoid from 'nanoid'

const KeyboardEventHandler: any = dynamic(
    () => import('react-keyboard-event-handler'),
    { ssr: false }
)

function handleTouchMove(e) {
    e.preventDefault()
}

const App = () => {
    useEffect(() => {
        //阻止二指滑动的默认浏览器 后退/前进 行为
        if (document) {
            document.addEventListener('wheel', handleTouchMove, {
                passive: false,
            })

            return () => {
                document.removeEventListener('wheel', handleTouchMove)
            }
        }
    }, [])
    const dispatch = useDispatch()
    const testWorkspace = useSelector((state: EditorState) => {
        return state.testWorkspace
    })
    const creating = useSelector((state: EditorState) => {
        return state.creating
    })
    const selection = useSelector((state: EditorState) => {
        return state.selection
    })
    const [mould] = useSelector((state: EditorState) => {
        const [[mouldId, currentState]] = state.selection || [[]]

        return [state.moulds[mouldId || -1], currentState]
    })

    const creatingStep = creating && creating.status

    return (
        <Flex
            flexDirection="column"
            bg="#f1f1f1"
            minHeight="100vh"
            alignItems="stretch"
            style={{ cursor: creatingStep ? 'crosshair' : 'unset' }}
            onMouseDown={() => {
                if (creatingStep) {
                    dispatch(cancelCreating())
                }
            }}
        >
            <KeyboardEventHandler
                handleKeys={['backspace', 'del']}
                onKeyEvent={() => {
                    dispatch(deleteNode())
                }}
            />
            {/* hit m to easy add a new mould */}
            <KeyboardEventHandler
                handleKeys={['m']}
                onKeyEvent={() => {
                    dispatch(
                        waitingForCreating({
                            mouldId: nanoid(6),
                            stateName: 'state 0',
                        })
                    )
                }}
            />
            {/* hit s to easy add a new mould */}
            <KeyboardEventHandler
                handleKeys={['s']}
                onKeyEvent={() => {
                    dispatch(
                        waitingForCreating({
                            mouldId: mould.id,
                            stateName: `state ${
                                Object.keys(mould.states).length
                            }`,
                        })
                    )
                }}
            />
            <KeyboardEventHandler
                handleKeys={['meta+z']}
                onKeyEvent={() => dispatch(undo())}
            ></KeyboardEventHandler>
            <Box width="100vw">
                <Toolbar></Toolbar>
            </Box>

            <Flex
                flex={1}
                overflow="hidden"
                flexDirection="row"
                alignItems="stretch"
                alignContent="stretch"
                style={{
                    position: 'relative',
                }}
            >
                <MouldStates></MouldStates>
                <Box
                    width={215}
                    style={{
                        transition: '0.3s',
                        position: 'absolute',
                        left: selection ? 0 : -215,
                        top: 0,
                        zIndex: 1,
                    }}
                    height="100vh"
                    borderRight="1px solid #aaaaaa"
                    backgroundColor="#e1e1e1"
                >
                    <ArcherContainer
                        style={{
                            height: '100%',
                            backgroundColor: '#e1e1e1',
                        }}
                        svgContainerStyle={{
                            overflow: 'visible',
                            pointerEvents: 'none',
                            zIndex: -1,
                        }}
                        strokeColor="red"
                        arrowLength={0}
                        strokeWidth={1}
                    >
                        <MouldScope></MouldScope>
                        <TitledBoard title="Kits">
                            <MouldKits></MouldKits>
                        </TitledBoard>
                        <TitledBoard title="Metas">
                            <MouldMetas></MouldMetas>
                            <MouldInput></MouldInput>
                        </TitledBoard>
                        <DebugPanel.Target></DebugPanel.Target>
                    </ArcherContainer>
                </Box>
                <Box
                    flex={1}
                    style={{
                        // zoom: selection ? 1 : 0.7,
                        transition: '0.3s',
                        // transform: selection ? 'scale(1)' : 'scale(0.75)',
                        overflow: 'visible',
                    }}
                >
                    <Workspace {...testWorkspace}></Workspace>
                </Box>
                <Box
                    width={215}
                    style={{
                        transition: '0.3s',
                        position: 'absolute',
                        right: selection ? 0 : -215,
                        top: 0,
                        zIndex: 1,
                    }}
                    height="100vh"
                    borderLeft="1px solid #aaaaaa"
                    backgroundColor="#e1e1e1"
                >
                    <TitledBoard title="Hierarchy">
                        <Explorer2></Explorer2>
                    </TitledBoard>
                    <PropertyToolBar.Target />
                </Box>
            </Flex>
        </Flex>
    )
}

export default () => {
    return (
        <Provider store={getStore()}>
            <DndProvider backend={HTML5Backend}>
                <RadixProvider>
                    <App></App>
                </RadixProvider>
            </DndProvider>
        </Provider>
    )
}
