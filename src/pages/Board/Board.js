import React, {
  useCallback, useEffect, useRef, useState,
} from 'react';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import { Log, setPreventUnload, validBoardId } from '#utils';
import routes from '#routes';
import { mainLayoutId, boardsErrors } from '#constants';
import {
  BoardError,
  BoardLeave,
  BoardCreatedWelcome,
  BoardJoinedWelcome,
  Canvas,
  HeadMeta,
  Modal,
  NotificationsList,
  Spinner,
  ToolBar,
} from '#components';
import {
  boardsService, drawingsService, realtimeService, urlsService,
} from '#services';
import {
  boardNameSelector, isJoinedSelector, isOwnerSelector, setJoined, setUnjoined, usersCountSelector,
} from '#store';

import SWrapper from './styled';

const drawingsId = 'drawings-canvas';
const mapId = 'map-canvas';

const modalSteps = Object.freeze({
  none           : 0,
  created        : 1,
  joinedFromHome : 2,
  joinedFromUrl  : 3,
  leave          : 4,
  error          : 5,
});

const Board = () => {
  const { push : redirectTo, block } = useHistory();
  const { state : routeState } = useLocation();
  const { id : boardId } = useParams();
  const dispatch = useDispatch();
  const usersCount = useSelector(usersCountSelector);
  const boardName = useSelector(boardNameSelector);
  const isOwner = useSelector(isOwnerSelector);
  const isJoined = useSelector(isJoinedSelector);
  const unblockRef = useRef();
  const isOwnerOnLoad = useRef(isOwner);
  const isJoinedOnLoad = useRef(isJoined);
  const [nextLocation, setNextLocation] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [modalStep, setModalStep] = useState(modalSteps.none);
  const [errorCode, setErrorCode] = useState();

  // Joining logic
  const join = useCallback(
    (userName) => {
      Log.debug('Component : Board : join', { boardId, userName });

      setIsLoading(true);

      realtimeService.start();
      boardsService.join(boardId, userName)
        .then(({ boardId : joinedBoardId, boardName : joinedBoardName, users }) => {
          Log.debug('Component : Board : join : joined', { joinedBoardId, joinedBoardName, users });

          drawingsService.start(drawingsId, mapId);
          dispatch(setJoined({ boardName : joinedBoardName, userName, users }));

          setModalStep(modalSteps.none);
        })
        .catch(({ code }) => {
          setModalStep(modalSteps.error);
          setErrorCode(code || boardsErrors.generic);
          realtimeService.stop();
        })
        .finally(() => setIsLoading(false));
    },
    [boardId, dispatch, setErrorCode, setModalStep, setIsLoading],
  );

  // Leaving logic
  useEffect(() => () => {
    dispatch(setUnjoined());
    realtimeService.stop();
    drawingsService.stop();
    urlsService.revokeAll();
  }, [dispatch]);

  // Already joined vs joining pending logic
  useEffect(() => {
    switch (true) {
      // Check valid board id first
      case !validBoardId(boardId):
        setModalStep(modalSteps.error);
        setErrorCode(boardsErrors.invalidId);
        break;

      // User came from home page - create board
      case isJoinedOnLoad.current:
        drawingsService.start(drawingsId, mapId);

        if (isOwnerOnLoad.current) {
          setModalStep(modalSteps.created);
        }
        break;

      // User came from home page - join board
      case !!routeState?.userName:
        setModalStep(modalSteps.joinedFromHome);
        join(routeState?.userName);
        break;

      // User came directly to the board page
      default:
        setModalStep(modalSteps.joinedFromUrl);
        break;
    }
  }, [join, routeState, boardId]);

  // Page unload prevention
  useEffect(() => {
    if (isJoined) {
      // In-app page unload
      unblockRef.current = block(({ pathname }) => {
        setNextLocation(pathname);
        setModalStep(modalSteps.leave);

        return false;
      });

      // Outside-of-app page unload
      setPreventUnload(true);

      return () => {
        if (unblockRef.current) {
          unblockRef.current();
        }

        setPreventUnload(false);
      };
    }

    return () => {};
  }, [block, isJoined, setModalStep, setNextLocation]);

  const goHome = () => redirectTo(routes.home);

  const leavePage = () => {
    unblockRef.current();
    redirectTo(nextLocation);
  };

  return (
    <>
      <HeadMeta
        route={routes.board}
        boardId={boardId}
        boardName={boardName}
      />
      <SWrapper>
        <ToolBar />
        <Canvas drawingsId={drawingsId} mapId={mapId} />
        <Modal target={mainLayoutId} show={modalStep !== modalSteps.none}>
          {modalStep === modalSteps.created && (
            <BoardCreatedWelcome
              boardId={boardId}
              onClose={() => setModalStep(modalSteps.none)}
            />
          )}
          {modalStep === modalSteps.joinedFromUrl && (
            <BoardJoinedWelcome
              isLoading={isLoading}
              boardId={boardId}
              onJoin={join}
              onCancel={goHome}
            />
          )}
          {modalStep === modalSteps.joinedFromHome && isLoading && (
            <Spinner size="md" />
          )}
          {modalStep === modalSteps.leave && (
            <BoardLeave
              isLast={usersCount === 1}
              onLeave={leavePage}
              onCancel={() => setModalStep(modalSteps.none)}
            />
          )}
          {modalStep === modalSteps.error && (
            <BoardError code={errorCode} onClose={goHome} />
          )}
        </Modal>
        <NotificationsList />
      </SWrapper>
    </>
  );
};

export default Board;
