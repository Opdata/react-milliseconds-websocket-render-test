# milliseconds-websocket-rendering-performance-test

## 시행착오 정리

1.  처음 useState, useEffect로 작업해봄 => 터짐(브라우저가 멈춰버림)
2.  괜찮은 샘플 코드 찾음 => 샘플 코드는 거래량이 비교가 될정도로 적음
3.  기존 코드를 recoil로 적용 => 브라우저 터짐
4.  redux로 교체 => 많이 개선됨
5.  불필요 코드 제거 및 메모이제이션 개선
6.  장시간 뒤에 렌더링을 못 버티는지 새로고침이나 창 닫기가 바로 안됨
7.  기존 웹워커랑 이벤트리스너를 callback, memo로 메모이제이션 => 많이 개선됨
    => 오래 좀 쌓이면 새로고침시 딜레이 있음
8.  리듀스를 웹워커로 분리하고 그 메시지가 오면 상태업데이트 => 너무 느려서 사용불가
9.  웹창이 최소화 상태일때는 렌더링 => 확인이 필요함 꼭 최소화 상태인 상황이 일어나지 않는지에 대한 확정적인 상황인지 => 최소화상태를 따질 필요 없이 성능에 문제가 없어야함
10. 상태는 업데이트 하지만 렌더링 하지 않을때 새로고침시 무한로딩이 발생하는지 => 무한로딩 발생 메모리 문제 확인됨

    - null로 객체 프로퍼티를 유지하는 방식 => delete로 프로퍼티를 아예 삭제하는 방식으로 변경
    - 위 방식은 delete 연산이 속도를 느리게 하지만 메모리를 더 아낄 수 있는 방법으로 생각되어 적용
    - 10분 지나니 메모리 터지기 직전에 디버그뜸, shallowEqual 적용 후 테스트
    - OrderGrid자체는 그대로 있고 orderItem들만 리렌더링 되는 방식으로 수정 중

11. useMemo 유무에 따른 Array 용량 확인할것 + orderIdsFunction 내부에서 callback을 써도 prices라는 배열은 계속 만들어지는 문제 찾음
    - 바로 위의 문제점을 useMemo로 압축하였으며, 반환 값이 밸류 인데 함수 콜백으로 생각하다보니 기존 useCallback을 잘못사용하고 있었음
    - ordersIdsFunction의 배열 정렬 방식을 sort 메서드에서 분할정복 알고리즘 방식으로 변경(ids배열의 길이가 크기 때문에 분할해서 정렬해야함)
12. 10번 무한로딩없이 잘 된다면 렌더링에 관한 최적화가 더 필요함, 결국 렌더링 문제라고 판단되기 때문
    - 노드의 개수가 무한대로 계속 증가하기 때문에, 모든 오더를 다 보여준다는건 좀 무리라고 생각됨 => 오더 내역을 쌓는 redux store state를 어느 범위를 제외하고는 주기적으로 비워주어야하는 쪽으로 생각이됨

- 우선 ids 정렬 방식을 바꾼 후 성능이 많이 좋아져서 12번 / 장시간 페이지 유지 후 새로고침 무한로딩 문제는 많이 해결됨

13. 오더가 계속 쌓이면서 결국에는 오더 데이터도 무한대로 쌓이고, 그로 인해 노드도 계속 추가되며 그걸 비교하기 위한 react fiber 객체도 계속 무한대로 증가하기 때문에 메모리가 무진장 많이 차지하게 되고 그로 인하여 문제가 발생된다고 생각이 된다.

    - 각 오더를 렌더링 하지 않고 ids 정렬까지만 수행했을 때는 성능의 문제가 없는걸로 확인되었음
    - 즉 렌더링해서 노드가 쌓이고 react fiber 객체가 커지고 이쪽에서 문제라는게 확실해졌음
    - [Chrome DOM size performance docs](https://developer.chrome.com/docs/lighthouse/performance/dom-size/)

14. 주문취소 혹은 체결됐을시 reduce 코드의 로직에서는 삭제 처리하나 기존 상태에서는 삭제처리 안하는 문제 발견하여 적용
