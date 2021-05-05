
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
        const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    const active_docs = new Set();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = node.ownerDocument;
        active_docs.add(doc);
        const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = doc.head.appendChild(element('style')).sheet);
        const current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});
        if (!current_rules[name]) {
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            active_docs.forEach(doc => {
                const stylesheet = doc.__svelte_stylesheet;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                doc.__svelte_rules = {};
            });
            active_docs.clear();
        });
    }

    function create_animation(node, from, fn, params) {
        if (!from)
            return noop;
        const to = node.getBoundingClientRect();
        if (from.left === to.left && from.right === to.right && from.top === to.top && from.bottom === to.bottom)
            return noop;
        const { delay = 0, duration = 300, easing = identity, 
        // @ts-ignore todo: should this be separated from destructuring? Or start/end added to public api and documentation?
        start: start_time = now() + delay, 
        // @ts-ignore todo:
        end = start_time + duration, tick = noop, css } = fn(node, { from, to }, params);
        let running = true;
        let started = false;
        let name;
        function start() {
            if (css) {
                name = create_rule(node, 0, 1, duration, delay, easing, css);
            }
            if (!delay) {
                started = true;
            }
        }
        function stop() {
            if (css)
                delete_rule(node, name);
            running = false;
        }
        loop(now => {
            if (!started && now >= start_time) {
                started = true;
            }
            if (started && now >= end) {
                tick(1, 0);
                stop();
            }
            if (!running) {
                return false;
            }
            if (started) {
                const p = now - start_time;
                const t = 0 + 1 * easing(p / duration);
                tick(t, 1 - t);
            }
            return true;
        });
        start();
        tick(0, 1);
        return stop;
    }
    function fix_position(node) {
        const style = getComputedStyle(node);
        if (style.position !== 'absolute' && style.position !== 'fixed') {
            const { width, height } = style;
            const a = node.getBoundingClientRect();
            node.style.position = 'absolute';
            node.style.width = width;
            node.style.height = height;
            add_transform(node, a);
        }
    }
    function add_transform(node, a) {
        const b = node.getBoundingClientRect();
        if (a.left !== b.left || a.top !== b.top) {
            const style = getComputedStyle(node);
            const transform = style.transform === 'none' ? '' : style.transform;
            node.style.transform = `${transform} translate(${a.left - b.left}px, ${a.top - b.top}px)`;
        }
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            callbacks.slice().forEach(fn => fn(event));
        }
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    const null_transition = { duration: 0 };
    function create_bidirectional_transition(node, fn, params, intro) {
        let config = fn(node, params);
        let t = intro ? 0 : 1;
        let running_program = null;
        let pending_program = null;
        let animation_name = null;
        function clear_animation() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function init(program, duration) {
            const d = program.b - t;
            duration *= Math.abs(d);
            return {
                a: t,
                b: program.b,
                d,
                duration,
                start: program.start,
                end: program.start + duration,
                group: program.group
            };
        }
        function go(b) {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            const program = {
                start: now() + delay,
                b
            };
            if (!b) {
                // @ts-ignore todo: improve typings
                program.group = outros;
                outros.r += 1;
            }
            if (running_program || pending_program) {
                pending_program = program;
            }
            else {
                // if this is an intro, and there's a delay, we need to do
                // an initial tick and/or apply CSS animation immediately
                if (css) {
                    clear_animation();
                    animation_name = create_rule(node, t, b, duration, delay, easing, css);
                }
                if (b)
                    tick(0, 1);
                running_program = init(program, duration);
                add_render_callback(() => dispatch(node, b, 'start'));
                loop(now => {
                    if (pending_program && now > pending_program.start) {
                        running_program = init(pending_program, duration);
                        pending_program = null;
                        dispatch(node, running_program.b, 'start');
                        if (css) {
                            clear_animation();
                            animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                        }
                    }
                    if (running_program) {
                        if (now >= running_program.end) {
                            tick(t = running_program.b, 1 - t);
                            dispatch(node, running_program.b, 'end');
                            if (!pending_program) {
                                // we're done
                                if (running_program.b) {
                                    // intro — we can tidy up immediately
                                    clear_animation();
                                }
                                else {
                                    // outro — needs to be coordinated
                                    if (!--running_program.group.r)
                                        run_all(running_program.group.c);
                                }
                            }
                            running_program = null;
                        }
                        else if (now >= running_program.start) {
                            const p = now - running_program.start;
                            t = running_program.a + running_program.d * easing(p / running_program.duration);
                            tick(t, 1 - t);
                        }
                    }
                    return !!(running_program || pending_program);
                });
            }
        }
        return {
            run(b) {
                if (is_function(config)) {
                    wait().then(() => {
                        // @ts-ignore
                        config = config();
                        go(b);
                    });
                }
                else {
                    go(b);
                }
            },
            end() {
                clear_animation();
                running_program = pending_program = null;
            }
        };
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function outro_and_destroy_block(block, lookup) {
        transition_out(block, 1, 1, () => {
            lookup.delete(block.key);
        });
    }
    function fix_and_outro_and_destroy_block(block, lookup) {
        block.f();
        outro_and_destroy_block(block, lookup);
    }
    function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                block.p(child_ctx, dirty);
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next);
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        return new_blocks;
    }
    function validate_each_keys(ctx, list, get_context, get_key) {
        const keys = new Set();
        for (let i = 0; i < list.length; i++) {
            const key = get_key(get_context(ctx, list, i));
            if (keys.has(key)) {
                throw new Error('Cannot have duplicate keys in a keyed each');
            }
            keys.add(key);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : options.context || []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.37.0' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }

    function flip(node, animation, params = {}) {
        const style = getComputedStyle(node);
        const transform = style.transform === 'none' ? '' : style.transform;
        const scaleX = animation.from.width / node.clientWidth;
        const scaleY = animation.from.height / node.clientHeight;
        const dx = (animation.from.left - animation.to.left) / scaleX;
        const dy = (animation.from.top - animation.to.top) / scaleY;
        const d = Math.sqrt(dx * dx + dy * dy);
        const { delay = 0, duration = (d) => Math.sqrt(d) * 120, easing = cubicOut } = params;
        return {
            delay,
            duration: is_function(duration) ? duration(d) : duration,
            easing,
            css: (_t, u) => `transform: ${transform} translate(${u * dx}px, ${u * dy}px);`
        };
    }

    function fly(node, { delay = 0, duration = 400, easing = cubicOut, x = 0, y = 0, opacity = 0 } = {}) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const transform = style.transform === 'none' ? '' : style.transform;
        const od = target_opacity * (1 - opacity);
        return {
            delay,
            duration,
            easing,
            css: (t, u) => `
			transform: ${transform} translate(${(1 - t) * x}px, ${(1 - t) * y}px);
			opacity: ${target_opacity - (od * u)}`
        };
    }

    /*
     * anime.js v3.2.1
     * (c) 2020 Julian Garnier
     * Released under the MIT license
     * animejs.com
     */

    // Defaults

    var defaultInstanceSettings = {
      update: null,
      begin: null,
      loopBegin: null,
      changeBegin: null,
      change: null,
      changeComplete: null,
      loopComplete: null,
      complete: null,
      loop: 1,
      direction: 'normal',
      autoplay: true,
      timelineOffset: 0
    };

    var defaultTweenSettings = {
      duration: 1000,
      delay: 0,
      endDelay: 0,
      easing: 'easeOutElastic(1, .5)',
      round: 0
    };

    var validTransforms = ['translateX', 'translateY', 'translateZ', 'rotate', 'rotateX', 'rotateY', 'rotateZ', 'scale', 'scaleX', 'scaleY', 'scaleZ', 'skew', 'skewX', 'skewY', 'perspective', 'matrix', 'matrix3d'];

    // Caching

    var cache = {
      CSS: {},
      springs: {}
    };

    // Utils

    function minMax(val, min, max) {
      return Math.min(Math.max(val, min), max);
    }

    function stringContains(str, text) {
      return str.indexOf(text) > -1;
    }

    function applyArguments(func, args) {
      return func.apply(null, args);
    }

    var is = {
      arr: function (a) { return Array.isArray(a); },
      obj: function (a) { return stringContains(Object.prototype.toString.call(a), 'Object'); },
      pth: function (a) { return is.obj(a) && a.hasOwnProperty('totalLength'); },
      svg: function (a) { return a instanceof SVGElement; },
      inp: function (a) { return a instanceof HTMLInputElement; },
      dom: function (a) { return a.nodeType || is.svg(a); },
      str: function (a) { return typeof a === 'string'; },
      fnc: function (a) { return typeof a === 'function'; },
      und: function (a) { return typeof a === 'undefined'; },
      nil: function (a) { return is.und(a) || a === null; },
      hex: function (a) { return /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(a); },
      rgb: function (a) { return /^rgb/.test(a); },
      hsl: function (a) { return /^hsl/.test(a); },
      col: function (a) { return (is.hex(a) || is.rgb(a) || is.hsl(a)); },
      key: function (a) { return !defaultInstanceSettings.hasOwnProperty(a) && !defaultTweenSettings.hasOwnProperty(a) && a !== 'targets' && a !== 'keyframes'; },
    };

    // Easings

    function parseEasingParameters(string) {
      var match = /\(([^)]+)\)/.exec(string);
      return match ? match[1].split(',').map(function (p) { return parseFloat(p); }) : [];
    }

    // Spring solver inspired by Webkit Copyright © 2016 Apple Inc. All rights reserved. https://webkit.org/demos/spring/spring.js

    function spring(string, duration) {

      var params = parseEasingParameters(string);
      var mass = minMax(is.und(params[0]) ? 1 : params[0], .1, 100);
      var stiffness = minMax(is.und(params[1]) ? 100 : params[1], .1, 100);
      var damping = minMax(is.und(params[2]) ? 10 : params[2], .1, 100);
      var velocity =  minMax(is.und(params[3]) ? 0 : params[3], .1, 100);
      var w0 = Math.sqrt(stiffness / mass);
      var zeta = damping / (2 * Math.sqrt(stiffness * mass));
      var wd = zeta < 1 ? w0 * Math.sqrt(1 - zeta * zeta) : 0;
      var a = 1;
      var b = zeta < 1 ? (zeta * w0 + -velocity) / wd : -velocity + w0;

      function solver(t) {
        var progress = duration ? (duration * t) / 1000 : t;
        if (zeta < 1) {
          progress = Math.exp(-progress * zeta * w0) * (a * Math.cos(wd * progress) + b * Math.sin(wd * progress));
        } else {
          progress = (a + b * progress) * Math.exp(-progress * w0);
        }
        if (t === 0 || t === 1) { return t; }
        return 1 - progress;
      }

      function getDuration() {
        var cached = cache.springs[string];
        if (cached) { return cached; }
        var frame = 1/6;
        var elapsed = 0;
        var rest = 0;
        while(true) {
          elapsed += frame;
          if (solver(elapsed) === 1) {
            rest++;
            if (rest >= 16) { break; }
          } else {
            rest = 0;
          }
        }
        var duration = elapsed * frame * 1000;
        cache.springs[string] = duration;
        return duration;
      }

      return duration ? solver : getDuration;

    }

    // Basic steps easing implementation https://developer.mozilla.org/fr/docs/Web/CSS/transition-timing-function

    function steps(steps) {
      if ( steps === void 0 ) steps = 10;

      return function (t) { return Math.ceil((minMax(t, 0.000001, 1)) * steps) * (1 / steps); };
    }

    // BezierEasing https://github.com/gre/bezier-easing

    var bezier = (function () {

      var kSplineTableSize = 11;
      var kSampleStepSize = 1.0 / (kSplineTableSize - 1.0);

      function A(aA1, aA2) { return 1.0 - 3.0 * aA2 + 3.0 * aA1 }
      function B(aA1, aA2) { return 3.0 * aA2 - 6.0 * aA1 }
      function C(aA1)      { return 3.0 * aA1 }

      function calcBezier(aT, aA1, aA2) { return ((A(aA1, aA2) * aT + B(aA1, aA2)) * aT + C(aA1)) * aT }
      function getSlope(aT, aA1, aA2) { return 3.0 * A(aA1, aA2) * aT * aT + 2.0 * B(aA1, aA2) * aT + C(aA1) }

      function binarySubdivide(aX, aA, aB, mX1, mX2) {
        var currentX, currentT, i = 0;
        do {
          currentT = aA + (aB - aA) / 2.0;
          currentX = calcBezier(currentT, mX1, mX2) - aX;
          if (currentX > 0.0) { aB = currentT; } else { aA = currentT; }
        } while (Math.abs(currentX) > 0.0000001 && ++i < 10);
        return currentT;
      }

      function newtonRaphsonIterate(aX, aGuessT, mX1, mX2) {
        for (var i = 0; i < 4; ++i) {
          var currentSlope = getSlope(aGuessT, mX1, mX2);
          if (currentSlope === 0.0) { return aGuessT; }
          var currentX = calcBezier(aGuessT, mX1, mX2) - aX;
          aGuessT -= currentX / currentSlope;
        }
        return aGuessT;
      }

      function bezier(mX1, mY1, mX2, mY2) {

        if (!(0 <= mX1 && mX1 <= 1 && 0 <= mX2 && mX2 <= 1)) { return; }
        var sampleValues = new Float32Array(kSplineTableSize);

        if (mX1 !== mY1 || mX2 !== mY2) {
          for (var i = 0; i < kSplineTableSize; ++i) {
            sampleValues[i] = calcBezier(i * kSampleStepSize, mX1, mX2);
          }
        }

        function getTForX(aX) {

          var intervalStart = 0;
          var currentSample = 1;
          var lastSample = kSplineTableSize - 1;

          for (; currentSample !== lastSample && sampleValues[currentSample] <= aX; ++currentSample) {
            intervalStart += kSampleStepSize;
          }

          --currentSample;

          var dist = (aX - sampleValues[currentSample]) / (sampleValues[currentSample + 1] - sampleValues[currentSample]);
          var guessForT = intervalStart + dist * kSampleStepSize;
          var initialSlope = getSlope(guessForT, mX1, mX2);

          if (initialSlope >= 0.001) {
            return newtonRaphsonIterate(aX, guessForT, mX1, mX2);
          } else if (initialSlope === 0.0) {
            return guessForT;
          } else {
            return binarySubdivide(aX, intervalStart, intervalStart + kSampleStepSize, mX1, mX2);
          }

        }

        return function (x) {
          if (mX1 === mY1 && mX2 === mY2) { return x; }
          if (x === 0 || x === 1) { return x; }
          return calcBezier(getTForX(x), mY1, mY2);
        }

      }

      return bezier;

    })();

    var penner = (function () {

      // Based on jQuery UI's implemenation of easing equations from Robert Penner (http://www.robertpenner.com/easing)

      var eases = { linear: function () { return function (t) { return t; }; } };

      var functionEasings = {
        Sine: function () { return function (t) { return 1 - Math.cos(t * Math.PI / 2); }; },
        Circ: function () { return function (t) { return 1 - Math.sqrt(1 - t * t); }; },
        Back: function () { return function (t) { return t * t * (3 * t - 2); }; },
        Bounce: function () { return function (t) {
          var pow2, b = 4;
          while (t < (( pow2 = Math.pow(2, --b)) - 1) / 11) {}
          return 1 / Math.pow(4, 3 - b) - 7.5625 * Math.pow(( pow2 * 3 - 2 ) / 22 - t, 2)
        }; },
        Elastic: function (amplitude, period) {
          if ( amplitude === void 0 ) amplitude = 1;
          if ( period === void 0 ) period = .5;

          var a = minMax(amplitude, 1, 10);
          var p = minMax(period, .1, 2);
          return function (t) {
            return (t === 0 || t === 1) ? t : 
              -a * Math.pow(2, 10 * (t - 1)) * Math.sin((((t - 1) - (p / (Math.PI * 2) * Math.asin(1 / a))) * (Math.PI * 2)) / p);
          }
        }
      };

      var baseEasings = ['Quad', 'Cubic', 'Quart', 'Quint', 'Expo'];

      baseEasings.forEach(function (name, i) {
        functionEasings[name] = function () { return function (t) { return Math.pow(t, i + 2); }; };
      });

      Object.keys(functionEasings).forEach(function (name) {
        var easeIn = functionEasings[name];
        eases['easeIn' + name] = easeIn;
        eases['easeOut' + name] = function (a, b) { return function (t) { return 1 - easeIn(a, b)(1 - t); }; };
        eases['easeInOut' + name] = function (a, b) { return function (t) { return t < 0.5 ? easeIn(a, b)(t * 2) / 2 : 
          1 - easeIn(a, b)(t * -2 + 2) / 2; }; };
        eases['easeOutIn' + name] = function (a, b) { return function (t) { return t < 0.5 ? (1 - easeIn(a, b)(1 - t * 2)) / 2 : 
          (easeIn(a, b)(t * 2 - 1) + 1) / 2; }; };
      });

      return eases;

    })();

    function parseEasings(easing, duration) {
      if (is.fnc(easing)) { return easing; }
      var name = easing.split('(')[0];
      var ease = penner[name];
      var args = parseEasingParameters(easing);
      switch (name) {
        case 'spring' : return spring(easing, duration);
        case 'cubicBezier' : return applyArguments(bezier, args);
        case 'steps' : return applyArguments(steps, args);
        default : return applyArguments(ease, args);
      }
    }

    // Strings

    function selectString(str) {
      try {
        var nodes = document.querySelectorAll(str);
        return nodes;
      } catch(e) {
        return;
      }
    }

    // Arrays

    function filterArray(arr, callback) {
      var len = arr.length;
      var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
      var result = [];
      for (var i = 0; i < len; i++) {
        if (i in arr) {
          var val = arr[i];
          if (callback.call(thisArg, val, i, arr)) {
            result.push(val);
          }
        }
      }
      return result;
    }

    function flattenArray(arr) {
      return arr.reduce(function (a, b) { return a.concat(is.arr(b) ? flattenArray(b) : b); }, []);
    }

    function toArray(o) {
      if (is.arr(o)) { return o; }
      if (is.str(o)) { o = selectString(o) || o; }
      if (o instanceof NodeList || o instanceof HTMLCollection) { return [].slice.call(o); }
      return [o];
    }

    function arrayContains(arr, val) {
      return arr.some(function (a) { return a === val; });
    }

    // Objects

    function cloneObject(o) {
      var clone = {};
      for (var p in o) { clone[p] = o[p]; }
      return clone;
    }

    function replaceObjectProps(o1, o2) {
      var o = cloneObject(o1);
      for (var p in o1) { o[p] = o2.hasOwnProperty(p) ? o2[p] : o1[p]; }
      return o;
    }

    function mergeObjects(o1, o2) {
      var o = cloneObject(o1);
      for (var p in o2) { o[p] = is.und(o1[p]) ? o2[p] : o1[p]; }
      return o;
    }

    // Colors

    function rgbToRgba(rgbValue) {
      var rgb = /rgb\((\d+,\s*[\d]+,\s*[\d]+)\)/g.exec(rgbValue);
      return rgb ? ("rgba(" + (rgb[1]) + ",1)") : rgbValue;
    }

    function hexToRgba(hexValue) {
      var rgx = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
      var hex = hexValue.replace(rgx, function (m, r, g, b) { return r + r + g + g + b + b; } );
      var rgb = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      var r = parseInt(rgb[1], 16);
      var g = parseInt(rgb[2], 16);
      var b = parseInt(rgb[3], 16);
      return ("rgba(" + r + "," + g + "," + b + ",1)");
    }

    function hslToRgba(hslValue) {
      var hsl = /hsl\((\d+),\s*([\d.]+)%,\s*([\d.]+)%\)/g.exec(hslValue) || /hsla\((\d+),\s*([\d.]+)%,\s*([\d.]+)%,\s*([\d.]+)\)/g.exec(hslValue);
      var h = parseInt(hsl[1], 10) / 360;
      var s = parseInt(hsl[2], 10) / 100;
      var l = parseInt(hsl[3], 10) / 100;
      var a = hsl[4] || 1;
      function hue2rgb(p, q, t) {
        if (t < 0) { t += 1; }
        if (t > 1) { t -= 1; }
        if (t < 1/6) { return p + (q - p) * 6 * t; }
        if (t < 1/2) { return q; }
        if (t < 2/3) { return p + (q - p) * (2/3 - t) * 6; }
        return p;
      }
      var r, g, b;
      if (s == 0) {
        r = g = b = l;
      } else {
        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
      }
      return ("rgba(" + (r * 255) + "," + (g * 255) + "," + (b * 255) + "," + a + ")");
    }

    function colorToRgb(val) {
      if (is.rgb(val)) { return rgbToRgba(val); }
      if (is.hex(val)) { return hexToRgba(val); }
      if (is.hsl(val)) { return hslToRgba(val); }
    }

    // Units

    function getUnit(val) {
      var split = /[+-]?\d*\.?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?(%|px|pt|em|rem|in|cm|mm|ex|ch|pc|vw|vh|vmin|vmax|deg|rad|turn)?$/.exec(val);
      if (split) { return split[1]; }
    }

    function getTransformUnit(propName) {
      if (stringContains(propName, 'translate') || propName === 'perspective') { return 'px'; }
      if (stringContains(propName, 'rotate') || stringContains(propName, 'skew')) { return 'deg'; }
    }

    // Values

    function getFunctionValue(val, animatable) {
      if (!is.fnc(val)) { return val; }
      return val(animatable.target, animatable.id, animatable.total);
    }

    function getAttribute(el, prop) {
      return el.getAttribute(prop);
    }

    function convertPxToUnit(el, value, unit) {
      var valueUnit = getUnit(value);
      if (arrayContains([unit, 'deg', 'rad', 'turn'], valueUnit)) { return value; }
      var cached = cache.CSS[value + unit];
      if (!is.und(cached)) { return cached; }
      var baseline = 100;
      var tempEl = document.createElement(el.tagName);
      var parentEl = (el.parentNode && (el.parentNode !== document)) ? el.parentNode : document.body;
      parentEl.appendChild(tempEl);
      tempEl.style.position = 'absolute';
      tempEl.style.width = baseline + unit;
      var factor = baseline / tempEl.offsetWidth;
      parentEl.removeChild(tempEl);
      var convertedUnit = factor * parseFloat(value);
      cache.CSS[value + unit] = convertedUnit;
      return convertedUnit;
    }

    function getCSSValue(el, prop, unit) {
      if (prop in el.style) {
        var uppercasePropName = prop.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
        var value = el.style[prop] || getComputedStyle(el).getPropertyValue(uppercasePropName) || '0';
        return unit ? convertPxToUnit(el, value, unit) : value;
      }
    }

    function getAnimationType(el, prop) {
      if (is.dom(el) && !is.inp(el) && (!is.nil(getAttribute(el, prop)) || (is.svg(el) && el[prop]))) { return 'attribute'; }
      if (is.dom(el) && arrayContains(validTransforms, prop)) { return 'transform'; }
      if (is.dom(el) && (prop !== 'transform' && getCSSValue(el, prop))) { return 'css'; }
      if (el[prop] != null) { return 'object'; }
    }

    function getElementTransforms(el) {
      if (!is.dom(el)) { return; }
      var str = el.style.transform || '';
      var reg  = /(\w+)\(([^)]*)\)/g;
      var transforms = new Map();
      var m; while (m = reg.exec(str)) { transforms.set(m[1], m[2]); }
      return transforms;
    }

    function getTransformValue(el, propName, animatable, unit) {
      var defaultVal = stringContains(propName, 'scale') ? 1 : 0 + getTransformUnit(propName);
      var value = getElementTransforms(el).get(propName) || defaultVal;
      if (animatable) {
        animatable.transforms.list.set(propName, value);
        animatable.transforms['last'] = propName;
      }
      return unit ? convertPxToUnit(el, value, unit) : value;
    }

    function getOriginalTargetValue(target, propName, unit, animatable) {
      switch (getAnimationType(target, propName)) {
        case 'transform': return getTransformValue(target, propName, animatable, unit);
        case 'css': return getCSSValue(target, propName, unit);
        case 'attribute': return getAttribute(target, propName);
        default: return target[propName] || 0;
      }
    }

    function getRelativeValue(to, from) {
      var operator = /^(\*=|\+=|-=)/.exec(to);
      if (!operator) { return to; }
      var u = getUnit(to) || 0;
      var x = parseFloat(from);
      var y = parseFloat(to.replace(operator[0], ''));
      switch (operator[0][0]) {
        case '+': return x + y + u;
        case '-': return x - y + u;
        case '*': return x * y + u;
      }
    }

    function validateValue(val, unit) {
      if (is.col(val)) { return colorToRgb(val); }
      if (/\s/g.test(val)) { return val; }
      var originalUnit = getUnit(val);
      var unitLess = originalUnit ? val.substr(0, val.length - originalUnit.length) : val;
      if (unit) { return unitLess + unit; }
      return unitLess;
    }

    // getTotalLength() equivalent for circle, rect, polyline, polygon and line shapes
    // adapted from https://gist.github.com/SebLambla/3e0550c496c236709744

    function getDistance(p1, p2) {
      return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
    }

    function getCircleLength(el) {
      return Math.PI * 2 * getAttribute(el, 'r');
    }

    function getRectLength(el) {
      return (getAttribute(el, 'width') * 2) + (getAttribute(el, 'height') * 2);
    }

    function getLineLength(el) {
      return getDistance(
        {x: getAttribute(el, 'x1'), y: getAttribute(el, 'y1')}, 
        {x: getAttribute(el, 'x2'), y: getAttribute(el, 'y2')}
      );
    }

    function getPolylineLength(el) {
      var points = el.points;
      var totalLength = 0;
      var previousPos;
      for (var i = 0 ; i < points.numberOfItems; i++) {
        var currentPos = points.getItem(i);
        if (i > 0) { totalLength += getDistance(previousPos, currentPos); }
        previousPos = currentPos;
      }
      return totalLength;
    }

    function getPolygonLength(el) {
      var points = el.points;
      return getPolylineLength(el) + getDistance(points.getItem(points.numberOfItems - 1), points.getItem(0));
    }

    // Path animation

    function getTotalLength(el) {
      if (el.getTotalLength) { return el.getTotalLength(); }
      switch(el.tagName.toLowerCase()) {
        case 'circle': return getCircleLength(el);
        case 'rect': return getRectLength(el);
        case 'line': return getLineLength(el);
        case 'polyline': return getPolylineLength(el);
        case 'polygon': return getPolygonLength(el);
      }
    }

    function setDashoffset(el) {
      var pathLength = getTotalLength(el);
      el.setAttribute('stroke-dasharray', pathLength);
      return pathLength;
    }

    // Motion path

    function getParentSvgEl(el) {
      var parentEl = el.parentNode;
      while (is.svg(parentEl)) {
        if (!is.svg(parentEl.parentNode)) { break; }
        parentEl = parentEl.parentNode;
      }
      return parentEl;
    }

    function getParentSvg(pathEl, svgData) {
      var svg = svgData || {};
      var parentSvgEl = svg.el || getParentSvgEl(pathEl);
      var rect = parentSvgEl.getBoundingClientRect();
      var viewBoxAttr = getAttribute(parentSvgEl, 'viewBox');
      var width = rect.width;
      var height = rect.height;
      var viewBox = svg.viewBox || (viewBoxAttr ? viewBoxAttr.split(' ') : [0, 0, width, height]);
      return {
        el: parentSvgEl,
        viewBox: viewBox,
        x: viewBox[0] / 1,
        y: viewBox[1] / 1,
        w: width,
        h: height,
        vW: viewBox[2],
        vH: viewBox[3]
      }
    }

    function getPath(path, percent) {
      var pathEl = is.str(path) ? selectString(path)[0] : path;
      var p = percent || 100;
      return function(property) {
        return {
          property: property,
          el: pathEl,
          svg: getParentSvg(pathEl),
          totalLength: getTotalLength(pathEl) * (p / 100)
        }
      }
    }

    function getPathProgress(path, progress, isPathTargetInsideSVG) {
      function point(offset) {
        if ( offset === void 0 ) offset = 0;

        var l = progress + offset >= 1 ? progress + offset : 0;
        return path.el.getPointAtLength(l);
      }
      var svg = getParentSvg(path.el, path.svg);
      var p = point();
      var p0 = point(-1);
      var p1 = point(+1);
      var scaleX = isPathTargetInsideSVG ? 1 : svg.w / svg.vW;
      var scaleY = isPathTargetInsideSVG ? 1 : svg.h / svg.vH;
      switch (path.property) {
        case 'x': return (p.x - svg.x) * scaleX;
        case 'y': return (p.y - svg.y) * scaleY;
        case 'angle': return Math.atan2(p1.y - p0.y, p1.x - p0.x) * 180 / Math.PI;
      }
    }

    // Decompose value

    function decomposeValue(val, unit) {
      // const rgx = /-?\d*\.?\d+/g; // handles basic numbers
      // const rgx = /[+-]?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/g; // handles exponents notation
      var rgx = /[+-]?\d*\.?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/g; // handles exponents notation
      var value = validateValue((is.pth(val) ? val.totalLength : val), unit) + '';
      return {
        original: value,
        numbers: value.match(rgx) ? value.match(rgx).map(Number) : [0],
        strings: (is.str(val) || unit) ? value.split(rgx) : []
      }
    }

    // Animatables

    function parseTargets(targets) {
      var targetsArray = targets ? (flattenArray(is.arr(targets) ? targets.map(toArray) : toArray(targets))) : [];
      return filterArray(targetsArray, function (item, pos, self) { return self.indexOf(item) === pos; });
    }

    function getAnimatables(targets) {
      var parsed = parseTargets(targets);
      return parsed.map(function (t, i) {
        return {target: t, id: i, total: parsed.length, transforms: { list: getElementTransforms(t) } };
      });
    }

    // Properties

    function normalizePropertyTweens(prop, tweenSettings) {
      var settings = cloneObject(tweenSettings);
      // Override duration if easing is a spring
      if (/^spring/.test(settings.easing)) { settings.duration = spring(settings.easing); }
      if (is.arr(prop)) {
        var l = prop.length;
        var isFromTo = (l === 2 && !is.obj(prop[0]));
        if (!isFromTo) {
          // Duration divided by the number of tweens
          if (!is.fnc(tweenSettings.duration)) { settings.duration = tweenSettings.duration / l; }
        } else {
          // Transform [from, to] values shorthand to a valid tween value
          prop = {value: prop};
        }
      }
      var propArray = is.arr(prop) ? prop : [prop];
      return propArray.map(function (v, i) {
        var obj = (is.obj(v) && !is.pth(v)) ? v : {value: v};
        // Default delay value should only be applied to the first tween
        if (is.und(obj.delay)) { obj.delay = !i ? tweenSettings.delay : 0; }
        // Default endDelay value should only be applied to the last tween
        if (is.und(obj.endDelay)) { obj.endDelay = i === propArray.length - 1 ? tweenSettings.endDelay : 0; }
        return obj;
      }).map(function (k) { return mergeObjects(k, settings); });
    }


    function flattenKeyframes(keyframes) {
      var propertyNames = filterArray(flattenArray(keyframes.map(function (key) { return Object.keys(key); })), function (p) { return is.key(p); })
      .reduce(function (a,b) { if (a.indexOf(b) < 0) { a.push(b); } return a; }, []);
      var properties = {};
      var loop = function ( i ) {
        var propName = propertyNames[i];
        properties[propName] = keyframes.map(function (key) {
          var newKey = {};
          for (var p in key) {
            if (is.key(p)) {
              if (p == propName) { newKey.value = key[p]; }
            } else {
              newKey[p] = key[p];
            }
          }
          return newKey;
        });
      };

      for (var i = 0; i < propertyNames.length; i++) loop( i );
      return properties;
    }

    function getProperties(tweenSettings, params) {
      var properties = [];
      var keyframes = params.keyframes;
      if (keyframes) { params = mergeObjects(flattenKeyframes(keyframes), params); }
      for (var p in params) {
        if (is.key(p)) {
          properties.push({
            name: p,
            tweens: normalizePropertyTweens(params[p], tweenSettings)
          });
        }
      }
      return properties;
    }

    // Tweens

    function normalizeTweenValues(tween, animatable) {
      var t = {};
      for (var p in tween) {
        var value = getFunctionValue(tween[p], animatable);
        if (is.arr(value)) {
          value = value.map(function (v) { return getFunctionValue(v, animatable); });
          if (value.length === 1) { value = value[0]; }
        }
        t[p] = value;
      }
      t.duration = parseFloat(t.duration);
      t.delay = parseFloat(t.delay);
      return t;
    }

    function normalizeTweens(prop, animatable) {
      var previousTween;
      return prop.tweens.map(function (t) {
        var tween = normalizeTweenValues(t, animatable);
        var tweenValue = tween.value;
        var to = is.arr(tweenValue) ? tweenValue[1] : tweenValue;
        var toUnit = getUnit(to);
        var originalValue = getOriginalTargetValue(animatable.target, prop.name, toUnit, animatable);
        var previousValue = previousTween ? previousTween.to.original : originalValue;
        var from = is.arr(tweenValue) ? tweenValue[0] : previousValue;
        var fromUnit = getUnit(from) || getUnit(originalValue);
        var unit = toUnit || fromUnit;
        if (is.und(to)) { to = previousValue; }
        tween.from = decomposeValue(from, unit);
        tween.to = decomposeValue(getRelativeValue(to, from), unit);
        tween.start = previousTween ? previousTween.end : 0;
        tween.end = tween.start + tween.delay + tween.duration + tween.endDelay;
        tween.easing = parseEasings(tween.easing, tween.duration);
        tween.isPath = is.pth(tweenValue);
        tween.isPathTargetInsideSVG = tween.isPath && is.svg(animatable.target);
        tween.isColor = is.col(tween.from.original);
        if (tween.isColor) { tween.round = 1; }
        previousTween = tween;
        return tween;
      });
    }

    // Tween progress

    var setProgressValue = {
      css: function (t, p, v) { return t.style[p] = v; },
      attribute: function (t, p, v) { return t.setAttribute(p, v); },
      object: function (t, p, v) { return t[p] = v; },
      transform: function (t, p, v, transforms, manual) {
        transforms.list.set(p, v);
        if (p === transforms.last || manual) {
          var str = '';
          transforms.list.forEach(function (value, prop) { str += prop + "(" + value + ") "; });
          t.style.transform = str;
        }
      }
    };

    // Set Value helper

    function setTargetsValue(targets, properties) {
      var animatables = getAnimatables(targets);
      animatables.forEach(function (animatable) {
        for (var property in properties) {
          var value = getFunctionValue(properties[property], animatable);
          var target = animatable.target;
          var valueUnit = getUnit(value);
          var originalValue = getOriginalTargetValue(target, property, valueUnit, animatable);
          var unit = valueUnit || getUnit(originalValue);
          var to = getRelativeValue(validateValue(value, unit), originalValue);
          var animType = getAnimationType(target, property);
          setProgressValue[animType](target, property, to, animatable.transforms, true);
        }
      });
    }

    // Animations

    function createAnimation(animatable, prop) {
      var animType = getAnimationType(animatable.target, prop.name);
      if (animType) {
        var tweens = normalizeTweens(prop, animatable);
        var lastTween = tweens[tweens.length - 1];
        return {
          type: animType,
          property: prop.name,
          animatable: animatable,
          tweens: tweens,
          duration: lastTween.end,
          delay: tweens[0].delay,
          endDelay: lastTween.endDelay
        }
      }
    }

    function getAnimations(animatables, properties) {
      return filterArray(flattenArray(animatables.map(function (animatable) {
        return properties.map(function (prop) {
          return createAnimation(animatable, prop);
        });
      })), function (a) { return !is.und(a); });
    }

    // Create Instance

    function getInstanceTimings(animations, tweenSettings) {
      var animLength = animations.length;
      var getTlOffset = function (anim) { return anim.timelineOffset ? anim.timelineOffset : 0; };
      var timings = {};
      timings.duration = animLength ? Math.max.apply(Math, animations.map(function (anim) { return getTlOffset(anim) + anim.duration; })) : tweenSettings.duration;
      timings.delay = animLength ? Math.min.apply(Math, animations.map(function (anim) { return getTlOffset(anim) + anim.delay; })) : tweenSettings.delay;
      timings.endDelay = animLength ? timings.duration - Math.max.apply(Math, animations.map(function (anim) { return getTlOffset(anim) + anim.duration - anim.endDelay; })) : tweenSettings.endDelay;
      return timings;
    }

    var instanceID = 0;

    function createNewInstance(params) {
      var instanceSettings = replaceObjectProps(defaultInstanceSettings, params);
      var tweenSettings = replaceObjectProps(defaultTweenSettings, params);
      var properties = getProperties(tweenSettings, params);
      var animatables = getAnimatables(params.targets);
      var animations = getAnimations(animatables, properties);
      var timings = getInstanceTimings(animations, tweenSettings);
      var id = instanceID;
      instanceID++;
      return mergeObjects(instanceSettings, {
        id: id,
        children: [],
        animatables: animatables,
        animations: animations,
        duration: timings.duration,
        delay: timings.delay,
        endDelay: timings.endDelay
      });
    }

    // Core

    var activeInstances = [];

    var engine = (function () {
      var raf;

      function play() {
        if (!raf && (!isDocumentHidden() || !anime.suspendWhenDocumentHidden) && activeInstances.length > 0) {
          raf = requestAnimationFrame(step);
        }
      }
      function step(t) {
        // memo on algorithm issue:
        // dangerous iteration over mutable `activeInstances`
        // (that collection may be updated from within callbacks of `tick`-ed animation instances)
        var activeInstancesLength = activeInstances.length;
        var i = 0;
        while (i < activeInstancesLength) {
          var activeInstance = activeInstances[i];
          if (!activeInstance.paused) {
            activeInstance.tick(t);
            i++;
          } else {
            activeInstances.splice(i, 1);
            activeInstancesLength--;
          }
        }
        raf = i > 0 ? requestAnimationFrame(step) : undefined;
      }

      function handleVisibilityChange() {
        if (!anime.suspendWhenDocumentHidden) { return; }

        if (isDocumentHidden()) {
          // suspend ticks
          raf = cancelAnimationFrame(raf);
        } else { // is back to active tab
          // first adjust animations to consider the time that ticks were suspended
          activeInstances.forEach(
            function (instance) { return instance ._onDocumentVisibility(); }
          );
          engine();
        }
      }
      if (typeof document !== 'undefined') {
        document.addEventListener('visibilitychange', handleVisibilityChange);
      }

      return play;
    })();

    function isDocumentHidden() {
      return !!document && document.hidden;
    }

    // Public Instance

    function anime(params) {
      if ( params === void 0 ) params = {};


      var startTime = 0, lastTime = 0, now = 0;
      var children, childrenLength = 0;
      var resolve = null;

      function makePromise(instance) {
        var promise = window.Promise && new Promise(function (_resolve) { return resolve = _resolve; });
        instance.finished = promise;
        return promise;
      }

      var instance = createNewInstance(params);
      makePromise(instance);

      function toggleInstanceDirection() {
        var direction = instance.direction;
        if (direction !== 'alternate') {
          instance.direction = direction !== 'normal' ? 'normal' : 'reverse';
        }
        instance.reversed = !instance.reversed;
        children.forEach(function (child) { return child.reversed = instance.reversed; });
      }

      function adjustTime(time) {
        return instance.reversed ? instance.duration - time : time;
      }

      function resetTime() {
        startTime = 0;
        lastTime = adjustTime(instance.currentTime) * (1 / anime.speed);
      }

      function seekChild(time, child) {
        if (child) { child.seek(time - child.timelineOffset); }
      }

      function syncInstanceChildren(time) {
        if (!instance.reversePlayback) {
          for (var i = 0; i < childrenLength; i++) { seekChild(time, children[i]); }
        } else {
          for (var i$1 = childrenLength; i$1--;) { seekChild(time, children[i$1]); }
        }
      }

      function setAnimationsProgress(insTime) {
        var i = 0;
        var animations = instance.animations;
        var animationsLength = animations.length;
        while (i < animationsLength) {
          var anim = animations[i];
          var animatable = anim.animatable;
          var tweens = anim.tweens;
          var tweenLength = tweens.length - 1;
          var tween = tweens[tweenLength];
          // Only check for keyframes if there is more than one tween
          if (tweenLength) { tween = filterArray(tweens, function (t) { return (insTime < t.end); })[0] || tween; }
          var elapsed = minMax(insTime - tween.start - tween.delay, 0, tween.duration) / tween.duration;
          var eased = isNaN(elapsed) ? 1 : tween.easing(elapsed);
          var strings = tween.to.strings;
          var round = tween.round;
          var numbers = [];
          var toNumbersLength = tween.to.numbers.length;
          var progress = (void 0);
          for (var n = 0; n < toNumbersLength; n++) {
            var value = (void 0);
            var toNumber = tween.to.numbers[n];
            var fromNumber = tween.from.numbers[n] || 0;
            if (!tween.isPath) {
              value = fromNumber + (eased * (toNumber - fromNumber));
            } else {
              value = getPathProgress(tween.value, eased * toNumber, tween.isPathTargetInsideSVG);
            }
            if (round) {
              if (!(tween.isColor && n > 2)) {
                value = Math.round(value * round) / round;
              }
            }
            numbers.push(value);
          }
          // Manual Array.reduce for better performances
          var stringsLength = strings.length;
          if (!stringsLength) {
            progress = numbers[0];
          } else {
            progress = strings[0];
            for (var s = 0; s < stringsLength; s++) {
              strings[s];
              var b = strings[s + 1];
              var n$1 = numbers[s];
              if (!isNaN(n$1)) {
                if (!b) {
                  progress += n$1 + ' ';
                } else {
                  progress += n$1 + b;
                }
              }
            }
          }
          setProgressValue[anim.type](animatable.target, anim.property, progress, animatable.transforms);
          anim.currentValue = progress;
          i++;
        }
      }

      function setCallback(cb) {
        if (instance[cb] && !instance.passThrough) { instance[cb](instance); }
      }

      function countIteration() {
        if (instance.remaining && instance.remaining !== true) {
          instance.remaining--;
        }
      }

      function setInstanceProgress(engineTime) {
        var insDuration = instance.duration;
        var insDelay = instance.delay;
        var insEndDelay = insDuration - instance.endDelay;
        var insTime = adjustTime(engineTime);
        instance.progress = minMax((insTime / insDuration) * 100, 0, 100);
        instance.reversePlayback = insTime < instance.currentTime;
        if (children) { syncInstanceChildren(insTime); }
        if (!instance.began && instance.currentTime > 0) {
          instance.began = true;
          setCallback('begin');
        }
        if (!instance.loopBegan && instance.currentTime > 0) {
          instance.loopBegan = true;
          setCallback('loopBegin');
        }
        if (insTime <= insDelay && instance.currentTime !== 0) {
          setAnimationsProgress(0);
        }
        if ((insTime >= insEndDelay && instance.currentTime !== insDuration) || !insDuration) {
          setAnimationsProgress(insDuration);
        }
        if (insTime > insDelay && insTime < insEndDelay) {
          if (!instance.changeBegan) {
            instance.changeBegan = true;
            instance.changeCompleted = false;
            setCallback('changeBegin');
          }
          setCallback('change');
          setAnimationsProgress(insTime);
        } else {
          if (instance.changeBegan) {
            instance.changeCompleted = true;
            instance.changeBegan = false;
            setCallback('changeComplete');
          }
        }
        instance.currentTime = minMax(insTime, 0, insDuration);
        if (instance.began) { setCallback('update'); }
        if (engineTime >= insDuration) {
          lastTime = 0;
          countIteration();
          if (!instance.remaining) {
            instance.paused = true;
            if (!instance.completed) {
              instance.completed = true;
              setCallback('loopComplete');
              setCallback('complete');
              if (!instance.passThrough && 'Promise' in window) {
                resolve();
                makePromise(instance);
              }
            }
          } else {
            startTime = now;
            setCallback('loopComplete');
            instance.loopBegan = false;
            if (instance.direction === 'alternate') {
              toggleInstanceDirection();
            }
          }
        }
      }

      instance.reset = function() {
        var direction = instance.direction;
        instance.passThrough = false;
        instance.currentTime = 0;
        instance.progress = 0;
        instance.paused = true;
        instance.began = false;
        instance.loopBegan = false;
        instance.changeBegan = false;
        instance.completed = false;
        instance.changeCompleted = false;
        instance.reversePlayback = false;
        instance.reversed = direction === 'reverse';
        instance.remaining = instance.loop;
        children = instance.children;
        childrenLength = children.length;
        for (var i = childrenLength; i--;) { instance.children[i].reset(); }
        if (instance.reversed && instance.loop !== true || (direction === 'alternate' && instance.loop === 1)) { instance.remaining++; }
        setAnimationsProgress(instance.reversed ? instance.duration : 0);
      };

      // internal method (for engine) to adjust animation timings before restoring engine ticks (rAF)
      instance._onDocumentVisibility = resetTime;

      // Set Value helper

      instance.set = function(targets, properties) {
        setTargetsValue(targets, properties);
        return instance;
      };

      instance.tick = function(t) {
        now = t;
        if (!startTime) { startTime = now; }
        setInstanceProgress((now + (lastTime - startTime)) * anime.speed);
      };

      instance.seek = function(time) {
        setInstanceProgress(adjustTime(time));
      };

      instance.pause = function() {
        instance.paused = true;
        resetTime();
      };

      instance.play = function() {
        if (!instance.paused) { return; }
        if (instance.completed) { instance.reset(); }
        instance.paused = false;
        activeInstances.push(instance);
        resetTime();
        engine();
      };

      instance.reverse = function() {
        toggleInstanceDirection();
        instance.completed = instance.reversed ? false : true;
        resetTime();
      };

      instance.restart = function() {
        instance.reset();
        instance.play();
      };

      instance.remove = function(targets) {
        var targetsArray = parseTargets(targets);
        removeTargetsFromInstance(targetsArray, instance);
      };

      instance.reset();

      if (instance.autoplay) { instance.play(); }

      return instance;

    }

    // Remove targets from animation

    function removeTargetsFromAnimations(targetsArray, animations) {
      for (var a = animations.length; a--;) {
        if (arrayContains(targetsArray, animations[a].animatable.target)) {
          animations.splice(a, 1);
        }
      }
    }

    function removeTargetsFromInstance(targetsArray, instance) {
      var animations = instance.animations;
      var children = instance.children;
      removeTargetsFromAnimations(targetsArray, animations);
      for (var c = children.length; c--;) {
        var child = children[c];
        var childAnimations = child.animations;
        removeTargetsFromAnimations(targetsArray, childAnimations);
        if (!childAnimations.length && !child.children.length) { children.splice(c, 1); }
      }
      if (!animations.length && !children.length) { instance.pause(); }
    }

    function removeTargetsFromActiveInstances(targets) {
      var targetsArray = parseTargets(targets);
      for (var i = activeInstances.length; i--;) {
        var instance = activeInstances[i];
        removeTargetsFromInstance(targetsArray, instance);
      }
    }

    // Stagger helpers

    function stagger(val, params) {
      if ( params === void 0 ) params = {};

      var direction = params.direction || 'normal';
      var easing = params.easing ? parseEasings(params.easing) : null;
      var grid = params.grid;
      var axis = params.axis;
      var fromIndex = params.from || 0;
      var fromFirst = fromIndex === 'first';
      var fromCenter = fromIndex === 'center';
      var fromLast = fromIndex === 'last';
      var isRange = is.arr(val);
      var val1 = isRange ? parseFloat(val[0]) : parseFloat(val);
      var val2 = isRange ? parseFloat(val[1]) : 0;
      var unit = getUnit(isRange ? val[1] : val) || 0;
      var start = params.start || 0 + (isRange ? val1 : 0);
      var values = [];
      var maxValue = 0;
      return function (el, i, t) {
        if (fromFirst) { fromIndex = 0; }
        if (fromCenter) { fromIndex = (t - 1) / 2; }
        if (fromLast) { fromIndex = t - 1; }
        if (!values.length) {
          for (var index = 0; index < t; index++) {
            if (!grid) {
              values.push(Math.abs(fromIndex - index));
            } else {
              var fromX = !fromCenter ? fromIndex%grid[0] : (grid[0]-1)/2;
              var fromY = !fromCenter ? Math.floor(fromIndex/grid[0]) : (grid[1]-1)/2;
              var toX = index%grid[0];
              var toY = Math.floor(index/grid[0]);
              var distanceX = fromX - toX;
              var distanceY = fromY - toY;
              var value = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
              if (axis === 'x') { value = -distanceX; }
              if (axis === 'y') { value = -distanceY; }
              values.push(value);
            }
            maxValue = Math.max.apply(Math, values);
          }
          if (easing) { values = values.map(function (val) { return easing(val / maxValue) * maxValue; }); }
          if (direction === 'reverse') { values = values.map(function (val) { return axis ? (val < 0) ? val * -1 : -val : Math.abs(maxValue - val); }); }
        }
        var spacing = isRange ? (val2 - val1) / maxValue : val1;
        return start + (spacing * (Math.round(values[i] * 100) / 100)) + unit;
      }
    }

    // Timeline

    function timeline(params) {
      if ( params === void 0 ) params = {};

      var tl = anime(params);
      tl.duration = 0;
      tl.add = function(instanceParams, timelineOffset) {
        var tlIndex = activeInstances.indexOf(tl);
        var children = tl.children;
        if (tlIndex > -1) { activeInstances.splice(tlIndex, 1); }
        function passThrough(ins) { ins.passThrough = true; }
        for (var i = 0; i < children.length; i++) { passThrough(children[i]); }
        var insParams = mergeObjects(instanceParams, replaceObjectProps(defaultTweenSettings, params));
        insParams.targets = insParams.targets || params.targets;
        var tlDuration = tl.duration;
        insParams.autoplay = false;
        insParams.direction = tl.direction;
        insParams.timelineOffset = is.und(timelineOffset) ? tlDuration : getRelativeValue(timelineOffset, tlDuration);
        passThrough(tl);
        tl.seek(insParams.timelineOffset);
        var ins = anime(insParams);
        passThrough(ins);
        children.push(ins);
        var timings = getInstanceTimings(children, params);
        tl.delay = timings.delay;
        tl.endDelay = timings.endDelay;
        tl.duration = timings.duration;
        tl.seek(0);
        tl.reset();
        if (tl.autoplay) { tl.play(); }
        return tl;
      };
      return tl;
    }

    anime.version = '3.2.1';
    anime.speed = 1;
    // TODO:#review: naming, documentation
    anime.suspendWhenDocumentHidden = true;
    anime.running = activeInstances;
    anime.remove = removeTargetsFromActiveInstances;
    anime.get = getOriginalTargetValue;
    anime.set = setTargetsValue;
    anime.convertPx = convertPxToUnit;
    anime.path = getPath;
    anime.setDashoffset = setDashoffset;
    anime.stagger = stagger;
    anime.timeline = timeline;
    anime.easing = parseEasings;
    anime.penner = penner;
    anime.random = function (min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; };

    function getDefaultExportFromCjs (x) {
    	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
    }

    function createCommonjsModule(fn) {
      var module = { exports: {} };
    	return fn(module, module.exports), module.exports;
    }

    /*!
     * Splide.js
     * Version  : 2.4.20
     * License  : MIT
     * Copyright: 2020 Naotoshi Fujita
     */

    var splide_esm = createCommonjsModule(function (module, exports) {
    (function webpackUniversalModuleDefinition(root, factory) {
    	module.exports = factory();
    })(self, function() {
    return /******/ (() => { // webpackBootstrap
    /******/ 	var __webpack_modules__ = ({

    /***/ 311:
    /***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

    // ESM COMPAT FLAG
    __webpack_require__.r(__webpack_exports__);

    // EXPORTS
    __webpack_require__.d(__webpack_exports__, {
      "default": () => /* binding */ module_Splide
    });

    // NAMESPACE OBJECT: ./src/js/constants/states.js
    var states_namespaceObject = {};
    __webpack_require__.r(states_namespaceObject);
    __webpack_require__.d(states_namespaceObject, {
      "CREATED": () => CREATED,
      "DESTROYED": () => DESTROYED,
      "IDLE": () => IDLE,
      "MOUNTED": () => MOUNTED,
      "MOVING": () => MOVING
    });
    /**
     * The function for providing an Event object simply managing events.
     *
     * @author    Naotoshi Fujita
     * @copyright Naotoshi Fujita. All rights reserved.
     */

    /**
     * The function for providing an Event object simply managing events.
     */
    /* harmony default export */ const core_event = (function () {
      /**
       * Store all event data.
       *
       * @type {Array}
       */
      var data = [];
      var Event = {
        /**
         * Subscribe the given event(s).
         *
         * @param {string}   events  - An event name. Use space to separate multiple events.
         *                             Also, namespace is accepted by dot, such as 'resize.{namespace}'.
         * @param {function} handler - A callback function.
         * @param {Element}  elm     - Optional. Native event will be listened to when this arg is provided.
         * @param {Object}   options - Optional. Options for addEventListener.
         */
        on: function on(events, handler, elm, options) {
          if (elm === void 0) {
            elm = null;
          }

          if (options === void 0) {
            options = {};
          }

          events.split(' ').forEach(function (event) {
            if (elm) {
              elm.addEventListener(event, handler, options);
            }

            data.push({
              event: event,
              handler: handler,
              elm: elm,
              options: options
            });
          });
        },

        /**
         * Unsubscribe the given event(s).
         *
         * @param {string}  events - A event name or names split by space.
         * @param {Element} elm    - Optional. removeEventListener() will be called when this arg is provided.
         */
        off: function off(events, elm) {
          if (elm === void 0) {
            elm = null;
          }

          events.split(' ').forEach(function (event) {
            data = data.filter(function (item) {
              if (item && item.event === event && item.elm === elm) {
                unsubscribe(item);
                return false;
              }

              return true;
            });
          });
        },

        /**
         * Emit an event.
         * This method is only for custom events.
         *
         * @param {string}  event - An event name.
         * @param {*}       args  - Any number of arguments passed to handlers.
         */
        emit: function emit(event) {
          for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
            args[_key - 1] = arguments[_key];
          }

          data.forEach(function (item) {
            if (!item.elm && item.event.split('.')[0] === event) {
              item.handler.apply(item, args);
            }
          });
        },

        /**
         * Clear event data.
         */
        destroy: function destroy() {
          data.forEach(unsubscribe);
          data = [];
        }
      };
      /**
       * Remove the registered event listener.
       *
       * @param {Object} item - An object containing event data.
       */

      function unsubscribe(item) {
        if (item.elm) {
          item.elm.removeEventListener(item.event, item.handler, item.options);
        }
      }

      return Event;
    });
    /**
     * The function providing a super simple state system.
     *
     * @author    Naotoshi Fujita
     * @copyright Naotoshi Fujita. All rights reserved.
     */

    /**
     * The function providing a super simple state system.
     *
     * @param {string|number} initialState - Provide the initial state value.
     */
    /* harmony default export */ const state = (function (initialState) {
      /**
       * Store the current state.
       *
       * @type {string|number}
       */
      var curr = initialState;
      return {
        /**
         * Change state.
         *
         * @param {string|number} state - A new state.
         */
        set: function set(state) {
          curr = state;
        },

        /**
         * Verify if the current state is given one or not.
         *
         * @param {string|number} state - A state name to be verified.
         *
         * @return {boolean} - True if the current state is the given one.
         */
        is: function is(state) {
          return state === curr;
        }
      };
    });
    function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

    /**
     * Some utility functions related with Object, supporting IE.
     *
     * @author    Naotoshi Fujita
     * @copyright Naotoshi Fujita. All rights reserved.
     */
    var keys = Object.keys;
    /**
     * Iterate an object like Array.forEach.
     * IE doesn't support forEach of HTMLCollection.
     *
     * @param {Object}    obj       - An object.
     * @param {function}  callback  - A function handling each value. Arguments are value, property and index.
     */

    function each(obj, callback) {
      keys(obj).some(function (key, index) {
        return callback(obj[key], key, index);
      });
    }
    /**
     * Return values of the given object as an array.
     * IE doesn't support Object.values.
     *
     * @param {Object} obj - An object.
     *
     * @return {Array} - An array containing all values of the given object.
     */

    function values(obj) {
      return keys(obj).map(function (key) {
        return obj[key];
      });
    }
    /**
     * Check if the given subject is object or not.
     *
     * @param {*} subject - A subject to be verified.
     *
     * @return {boolean} - True if object, false otherwise.
     */

    function isObject(subject) {
      return typeof subject === 'object';
    }
    /**
     * Merge two objects deeply.
     *
     * @param {Object} to   - An object where "from" is merged.
     * @param {Object} from - An object merged to "to".
     *
     * @return {Object} - A merged object.
     */

    function merge(_ref, from) {
      var to = _extends({}, _ref);

      each(from, function (value, key) {
        if (isObject(value)) {
          if (!isObject(to[key])) {
            to[key] = {};
          }

          to[key] = merge(to[key], value);
        } else {
          to[key] = value;
        }
      });
      return to;
    }
    /**
     * Assign all properties "from" to "to" object.
     *
     * @param {Object} to   - An object where properties are assigned.
     * @param {Object} from - An object whose properties are assigned to "to".
     *
     * @return {Object} - An assigned object.
     */

    function object_assign(to, from) {
      keys(from).forEach(function (key) {
        if (!to[key]) {
          Object.defineProperty(to, key, Object.getOwnPropertyDescriptor(from, key));
        }
      });
      return to;
    }
    /**
     * A package of some miscellaneous utility functions.
     *
     * @author    Naotoshi Fujita
     * @copyright Naotoshi Fujita. All rights reserved.
     */

    /**
     * Convert the given value to array.
     *
     * @param {*} value - Any value.
     *
     * @return {*[]} - Array containing the given value.
     */

    function toArray(value) {
      return Array.isArray(value) ? value : [value];
    }
    /**
     * Check if the given value is between min and max.
     * Min will be returned when the value is less than min or max will do when greater than max.
     *
     * @param {number} value - A number to be checked.
     * @param {number} m1    - Minimum or maximum number.
     * @param {number} m2    - Maximum or minimum number.
     *
     * @return {number} - A value itself, min or max.
     */

    function between(value, m1, m2) {
      return Math.min(Math.max(value, m1 > m2 ? m2 : m1), m1 > m2 ? m1 : m2);
    }
    /**
     * The sprintf method with minimum functionality.
     *
     * @param {string}       format       - The string format.
     * @param {string|Array} replacements - Replacements accepting multiple arguments.
     *
     * @returns {string} - Converted string.
     */

    function sprintf(format, replacements) {
      var i = 0;
      return format.replace(/%s/g, function () {
        return toArray(replacements)[i++];
      });
    }
    /**
     * Append px unit to the given subject if necessary.
     *
     * @param {number|string} value - A value that may not include an unit.
     *
     * @return {string} - If the value is string, return itself.
     *                    If number, do value + "px". An empty string, otherwise.
     */

    function unit(value) {
      var type = typeof value;

      if (type === 'number' && value > 0) {
        return parseFloat(value) + 'px';
      }

      return type === 'string' ? value : '';
    }
    /**
     * Pad start with 0.
     *
     * @param {number} number - A number to be filled with 0.
     *
     * @return {string|number} - Padded number.
     */

    function pad(number) {
      return number < 10 ? '0' + number : number;
    }
    /**
     * Convert the given value to pixel.
     *
     * @param {Element}       root  - Root element where a dummy div is appended.
     * @param {string|number} value - CSS value to be converted, such as 10rem.
     *
     * @return {number} - Pixel.
     */

    function toPixel(root, value) {
      if (typeof value === 'string') {
        var div = create('div', {});
        applyStyle(div, {
          position: 'absolute',
          width: value
        });
        append(root, div);
        value = div.clientWidth;
        dom_remove(div);
      }

      return +value || 0;
    }
    /**
     * Some utility functions related with DOM.
     *
     * @author    Naotoshi Fujita
     * @copyright Naotoshi Fujita. All rights reserved.
     */


    /**
     * Find the first element matching the given selector.
     * Be aware that all selectors after a space are ignored.
     *
     * @param {Element|Node}  elm       - An ancestor element.
     * @param {string}        selector  - DOMString.
     *
     * @return {Element|null} - A found element or null.
     */

    function find(elm, selector) {
      return elm ? elm.querySelector(selector.split(' ')[0]) : null;
    }
    /**
     * Find a first child having the given tag or class name.
     *
     * @param {Element} parent         - A parent element.
     * @param {string}  tagOrClassName - A tag or class name.
     *
     * @return {Element|undefined} - A found element on success or undefined on failure.
     */

    function child(parent, tagOrClassName) {
      return children(parent, tagOrClassName)[0];
    }
    /**
     * Return chile elements that matches the provided tag or class name.
     *
     * @param {Element} parent         - A parent element.
     * @param {string}  tagOrClassName - A tag or class name.
     *
     * @return {Element[]} - Found elements.
     */

    function children(parent, tagOrClassName) {
      if (parent) {
        return values(parent.children).filter(function (child) {
          return hasClass(child, tagOrClassName.split(' ')[0]) || child.tagName === tagOrClassName;
        });
      }

      return [];
    }
    /**
     * Create an element with some optional attributes.
     *
     * @param {string} tag   - A tag name.
     * @param {Object} attrs - An object any attribute pairs of name and value.
     *
     * @return {Element} - A created element.
     */

    function create(tag, attrs) {
      var elm = document.createElement(tag);
      each(attrs, function (value, key) {
        return setAttribute(elm, key, value);
      });
      return elm;
    }
    /**
     * Convert HTML string to DOM node.
     *
     * @param {string} html - HTML string.
     *
     * @return {Node} - A created node.
     */

    function domify(html) {
      var div = create('div', {});
      div.innerHTML = html;
      return div.firstChild;
    }
    /**
     * Remove a given element from a DOM tree.
     *
     * @param {Element|Element[]} elms - Element(s) to be removed.
     */

    function dom_remove(elms) {
      toArray(elms).forEach(function (elm) {
        if (elm) {
          var parent = elm.parentElement;
          parent && parent.removeChild(elm);
        }
      });
    }
    /**
     * Append a child to a given element.
     *
     * @param {Element} parent - A parent element.
     * @param {Element} child  - An element to be appended.
     */

    function append(parent, child) {
      if (parent) {
        parent.appendChild(child);
      }
    }
    /**
     * Insert an element before the reference element.
     *
     * @param {Element|Node} ref - A reference element.
     * @param {Element}      elm - An element to be inserted.
     */

    function before(elm, ref) {
      if (elm && ref) {
        var parent = ref.parentElement;
        parent && parent.insertBefore(elm, ref);
      }
    }
    /**
     * Apply styles to the given element.
     *
     * @param {Element} elm     - An element where styles are applied.
     * @param {Object}  styles  - Object containing styles.
     */

    function applyStyle(elm, styles) {
      if (elm) {
        each(styles, function (value, prop) {
          if (value !== null) {
            elm.style[prop] = value;
          }
        });
      }
    }
    /**
     * Add or remove classes to/from the element.
     * This function is for internal usage.
     *
     * @param {Element}         elm     - An element where classes are added.
     * @param {string|string[]} classes - Class names being added.
     * @param {boolean}         remove  - Whether to remove or add classes.
     */

    function addOrRemoveClasses(elm, classes, remove) {
      if (elm) {
        toArray(classes).forEach(function (name) {
          if (name) {
            elm.classList[remove ? 'remove' : 'add'](name);
          }
        });
      }
    }
    /**
     * Add classes to the element.
     *
     * @param {Element}          elm     - An element where classes are added.
     * @param {string|string[]}  classes - Class names being added.
     */


    function addClass(elm, classes) {
      addOrRemoveClasses(elm, classes, false);
    }
    /**
     * Remove a class from the element.
     *
     * @param {Element}         elm     - An element where classes are removed.
     * @param {string|string[]} classes - A class name being removed.
     */

    function removeClass(elm, classes) {
      addOrRemoveClasses(elm, classes, true);
    }
    /**
     * Verify if the provided element has the class or not.
     *
     * @param {Element} elm       - An element.
     * @param {string}  className - A class name.
     *
     * @return {boolean} - True if the element has the class or false if not.
     */

    function hasClass(elm, className) {
      return !!elm && elm.classList.contains(className);
    }
    /**
     * Set attribute to the given element.
     *
     * @param {Element}                 elm   - An element where an attribute is assigned.
     * @param {string}                  name  - Attribute name.
     * @param {string|number|boolean}   value - Attribute value.
     */

    function setAttribute(elm, name, value) {
      if (elm) {
        elm.setAttribute(name, value);
      }
    }
    /**
     * Get attribute from the given element.
     *
     * @param {Element} elm  - An element where an attribute is assigned.
     * @param {string}  name - Attribute name.
     *
     * @return {string} - The value of the given attribute if available. An empty string if not.
     */

    function getAttribute(elm, name) {
      return elm ? elm.getAttribute(name) : '';
    }
    /**
     * Remove attribute from the given element.
     *
     * @param {Element|Element[]} elms  - An element where an attribute is removed.
     * @param {string|string[]}      names - Attribute name.
     */

    function removeAttribute(elms, names) {
      toArray(names).forEach(function (name) {
        toArray(elms).forEach(function (elm) {
          return elm && elm.removeAttribute(name);
        });
      });
    }
    /**
     * Return the Rect object of the provided object.
     *
     * @param {Element} elm - An element.
     *
     * @return {ClientRect|DOMRect} - A rect object.
     */

    function getRect(elm) {
      return elm.getBoundingClientRect();
    }
    /**
     * Trigger the given callback after all images contained by the element are loaded.
     *
     * @param {Element}  elm      - Element that may contain images.
     * @param {Function} callback - Callback function fired right after all images are loaded.
     */

    function loaded(elm, callback) {
      var images = elm.querySelectorAll('img');
      var length = images.length;

      if (length) {
        var count = 0;
        each(images, function (img) {
          img.onload = img.onerror = function () {
            if (++count === length) {
              callback();
            }
          };
        });
      } else {
        // Trigger the callback immediately if there is no image.
        callback();
      }
    }
    /**
     * Export slider types.
     *
     * @author    Naotoshi Fujita
     * @copyright Naotoshi Fujita. All rights reserved.
     */

    /**
     * Normal slider.
     *
     * @type {string}
     */
    var SLIDE = 'slide';
    /**
     * Loop after the last slide and before the first one.
     *
     * @type {string}
     */

    var LOOP = 'loop';
    /**
     * The track doesn't move.
     *
     * @type {string}
     */

    var FADE = 'fade';
    /**
     * The component for general slide effect transition.
     *
     * @author    Naotoshi Fujita
     * @copyright Naotoshi Fujita. All rights reserved.
     */


    /**
     * The component for general slide effect transition.
     *
     * @param {Splide} Splide     - A Splide instance.
     * @param {Object} Components - An object containing components.
     *
     * @return {Object} - The component object.
     */

    /* harmony default export */ const slide = (function (Splide, Components) {
      /**
       * Hold the list element.
       *
       * @type {Element}
       */
      var list;
      /**
       * Hold the onEnd callback function.
       *
       * @type {function}
       */

      var endCallback;
      return {
        /**
         * Called when the component is mounted.
         */
        mount: function mount() {
          list = Components.Elements.list;
          Splide.on('transitionend', function (e) {
            if (e.target === list && endCallback) {
              endCallback();
            }
          }, list);
        },

        /**
         * Start transition.
         *
         * @param {number}   destIndex - Destination slide index that might be clone's.
         * @param {number}   newIndex  - New index.
         * @param {number}   prevIndex - Previous index.
         * @param {Object}   coord     - Destination coordinates.
         * @param {function} done      - Callback function must be invoked when transition is completed.
         */
        start: function start(destIndex, newIndex, prevIndex, coord, done) {
          var options = Splide.options;
          var edgeIndex = Components.Controller.edgeIndex;
          var speed = options.speed;
          endCallback = done;

          if (Splide.is(SLIDE)) {
            if (prevIndex === 0 && newIndex >= edgeIndex || prevIndex >= edgeIndex && newIndex === 0) {
              speed = options.rewindSpeed || speed;
            }
          }

          applyStyle(list, {
            transition: "transform " + speed + "ms " + options.easing,
            transform: "translate(" + coord.x + "px," + coord.y + "px)"
          });
        }
      };
    });
    /**
     * The component for fade transition.
     *
     * @author    Naotoshi Fujita
     * @copyright Naotoshi Fujita. All rights reserved.
     */


    /**
     * The component for fade transition.
     *
     * @param {Splide} Splide     - A Splide instance.
     * @param {Object} Components - An object containing components.
     *
     * @return {Object} - The component object.
     */

    /* harmony default export */ const fade = (function (Splide, Components) {
      var Fade = {
        /**
         * Called when the component is mounted.
         * Apply transition style to the first slide.
         */
        mount: function mount() {
          apply(Splide.index);
        },

        /**
         * Start transition.
         *
         * @param {number}    destIndex - Destination slide index that might be clone's.
         * @param {number}    newIndex  - New index.
         * @param {number}    prevIndex - Previous index.
         * @param {Object}    coord     - Destination coordinates.
         * @param {function}  done      - Callback function must be invoked when transition is completed.
         */
        start: function start(destIndex, newIndex, prevIndex, coord, done) {
          var track = Components.Elements.track;
          applyStyle(track, {
            height: unit(track.clientHeight)
          });
          apply(newIndex);
          setTimeout(function () {
            done();
            applyStyle(track, {
              height: ''
            });
          });
        }
      };
      /**
       * Apply transition style to the slide specified by the given index.
       *
       * @param {number} index - A slide index.
       */

      function apply(index) {
        var options = Splide.options;
        applyStyle(Components.Elements.slides[index], {
          transition: "opacity " + options.speed + "ms " + options.easing
        });
      }

      return Fade;
    });
    /**
     * Provide a function for composing components.
     *
     * @author    Naotoshi Fujita
     * @copyright Naotoshi Fujita. All rights reserved.
     */



    /**
     * Compose components.
     *
     * @param {Splide}   Splide     - Splide instance.
     * @param {Object}   Components - Additional components.
     * @param {function} Transition - Change component for transition.
     *
     * @return {Object} - An object containing all components.
     */

    function compose(Splide, Components, Transition) {
      var components = {};
      each(Components, function (Component, name) {
        components[name] = Component(Splide, components, name.toLowerCase());
      });

      if (!Transition) {
        Transition = Splide.is(FADE) ? fade : slide;
      }

      components.Transition = Transition(Splide, components);
      return components;
    }
    /**
     * Utility functions for outputting logs.
     *
     * @author    Naotoshi Fujita
     * @copyright Naotoshi Fujita. All rights reserved.
     */

    /**
     * Prefix of an error massage.
     *
     * @type {string}
     */
    var MESSAGE_PREFIX = '[SPLIDE]';
    /**
     * Display an error message on the browser console.
     *
     * @param {string} message - An error message.
     */

    function error(message) {
      console.error(MESSAGE_PREFIX + " " + message);
    }
    /**
     * Check existence of the given object and throw an error if it doesn't.
     *
     * @throws {Error}
     *
     * @param {*}      subject - A subject to be confirmed.
     * @param {string} message - An error message.
     */

    function exist(subject, message) {
      if (!subject) {
        throw new Error(message);
      }
    }
    /**
     * Export class names.
     *
     * @author    Naotoshi Fujita
     * @copyright Naotoshi Fujita. All rights reserved.
     */

    /**
     * A root class name.
     *
     * @type {string}
     */
    var ROOT = 'splide';
    /**
     * The definition table of all classes for elements.
     * They might be modified by options.
     *
     * @type {Object}
     */

    var ELEMENT_CLASSES = {
      root: ROOT,
      slider: ROOT + "__slider",
      track: ROOT + "__track",
      list: ROOT + "__list",
      slide: ROOT + "__slide",
      container: ROOT + "__slide__container",
      arrows: ROOT + "__arrows",
      arrow: ROOT + "__arrow",
      prev: ROOT + "__arrow--prev",
      next: ROOT + "__arrow--next",
      pagination: ROOT + "__pagination",
      page: ROOT + "__pagination__page",
      clone: ROOT + "__slide--clone",
      progress: ROOT + "__progress",
      bar: ROOT + "__progress__bar",
      autoplay: ROOT + "__autoplay",
      play: ROOT + "__play",
      pause: ROOT + "__pause",
      spinner: ROOT + "__spinner",
      sr: ROOT + "__sr"
    };
    /**
     * Definitions of status classes.
     *
     * @type {Object}
     */

    var STATUS_CLASSES = {
      active: 'is-active',
      visible: 'is-visible',
      loading: 'is-loading'
    };
    /**
     * Export i18n texts as object.
     *
     * @author    Naotoshi Fujita
     * @copyright Naotoshi Fujita. All rights reserved.
     */

    /**
     * Texts for i18n.
     *
     * @type {Object}
     */
    var I18N = {
      prev: 'Previous slide',
      next: 'Next slide',
      first: 'Go to first slide',
      last: 'Go to last slide',
      slideX: 'Go to slide %s',
      pageX: 'Go to page %s',
      play: 'Start autoplay',
      pause: 'Pause autoplay'
    };
    /**
     * Export default options.
     *
     * @author    Naotoshi Fujita
     * @copyright Naotoshi Fujita. All rights reserved.
     */


    var DEFAULTS = {
      /**
       * Determine a slider type.
       * - 'slide': Regular slider.
       * - 'loop' : Carousel slider.
       * - 'fade' : Change slides with fade transition. perPage, drag options are ignored.
       *
       * @type {string}
       */
      type: 'slide',

      /**
       * Whether to rewind a slider before the first slide or after the last one.
       * In "loop" mode, this option is ignored.
       *
       * @type {boolean}
       */
      rewind: false,

      /**
       * Transition speed in milliseconds.
       *
       * @type {number}
       */
      speed: 400,

      /**
       * Transition speed on rewind in milliseconds.
       *
       * @type {number}
       */
      rewindSpeed: 0,

      /**
       * Whether to prevent any actions while a slider is transitioning.
       * If false, navigation, drag and swipe work while the slider is running.
       * Even so, it will be forced to wait for transition in some cases in the loop mode to shift a slider.
       *
       * @type {boolean}
       */
      waitForTransition: true,

      /**
       * Define slider max width.
       *
       * @type {number}
       */
      width: 0,

      /**
       * Define slider height.
       *
       * @type {number}
       */
      height: 0,

      /**
       * Fix width of slides. CSS format is allowed such as 10em, 80% or 80vw.
       * perPage number will be ignored when this option is falsy.
       *
       * @type {number|string}
       */
      fixedWidth: 0,

      /**
       * Fix height of slides. CSS format is allowed such as 10em, 80vh but % unit is not accepted.
       * heightRatio option will be ignored when this option is falsy.
       *
       * @type {number|string}
       */
      fixedHeight: 0,

      /**
       * Determine height of slides by ratio to a slider width.
       * This will be ignored when the fixedHeight is provided.
       *
       * @type {number}
       */
      heightRatio: 0,

      /**
       * If true, slide width will be determined by the element width itself.
       * - perPage/perMove should be 1.
       *
       * @type {boolean}
       */
      autoWidth: false,

      /**
       * If true, slide height will be determined by the element width itself.
       * - perPage/perMove should be 1.
       *
       * @type {boolean}
       */
      autoHeight: false,

      /**
       * Determine how many slides should be displayed per page.
       *
       * @type {number}
       */
      perPage: 1,

      /**
       * Determine how many slides should be moved when a slider goes to next or perv.
       *
       * @type {number}
       */
      perMove: 0,

      /**
       * Determine manually how many clones should be generated on the left and right side.
       * The total number of clones will be twice of this number.
       *
       * @type {number}
       */
      clones: 0,

      /**
       * Start index.
       *
       * @type {number}
       */
      start: 0,

      /**
       * Determine which slide should be focused if there are multiple slides in a page.
       * A string "center" is acceptable for centering slides.
       *
       * @type {boolean|number|string}
       */
      focus: false,

      /**
       * Gap between slides. CSS format is allowed such as 1em.
       *
       * @type {number|string}
       */
      gap: 0,

      /**
       * Set padding-left/right in horizontal mode or padding-top/bottom in vertical one.
       * Give a single value to set a same size for both sides or
       * do an object for different sizes.
       * Also, CSS format is allowed such as 1em.
       *
       * @example
       * - 10: Number
       * - '1em': CSS format.
       * - { left: 0, right: 20 }: Object for different sizes in horizontal mode.
       * - { top: 0, bottom: 20 }: Object for different sizes in vertical mode.
       *
       * @type {number|string|Object}
       */
      padding: 0,

      /**
       * Whether to append arrows.
       *
       * @type {boolean}
       */
      arrows: true,

      /**
       * Change the arrow SVG path like 'm7.61 0.807-2.12...'.
       *
       * @type {string}
       */
      arrowPath: '',

      /**
       * Whether to append pagination(indicator dots) or not.
       *
       * @type {boolean}
       */
      pagination: true,

      /**
       * Activate autoplay.
       *
       * @type {boolean}
       */
      autoplay: false,

      /**
       * Autoplay interval in milliseconds.
       *
       * @type {number}
       */
      interval: 5000,

      /**
       * Whether to stop autoplay when a slider is hovered.
       *
       * @type {boolean}
       */
      pauseOnHover: true,

      /**
       * Whether to stop autoplay when a slider elements are focused.
       * True is recommended for accessibility.
       *
       * @type {boolean}
       */
      pauseOnFocus: true,

      /**
       * Whether to reset progress of the autoplay timer when resumed.
       *
       * @type {boolean}
       */
      resetProgress: true,

      /**
       * Loading images lazily.
       * Image src must be provided by a data-splide-lazy attribute.
       *
       * - false: Do nothing.
       * - 'nearby': Only images around an active slide will be loaded.
       * - 'sequential': All images will be sequentially loaded.
       *
       * @type {boolean|string}
       */
      lazyLoad: false,

      /**
       * This option works only when a lazyLoad option is "nearby".
       * Determine how many pages(not slides) around an active slide should be loaded beforehand.
       *
       * @type {number}
       */
      preloadPages: 1,

      /**
       * Easing for CSS transition. For example, linear, ease or cubic-bezier().
       *
       * @type {string}
       */
      easing: 'cubic-bezier(.42,.65,.27,.99)',

      /**
       * Whether to enable keyboard shortcuts
       * - true or 'global': Listen to keydown event of the document.
       * - 'focused': Listen to the keydown event of the slider root element. tabindex="0" will be added to the element.
       * - false: Disable keyboard shortcuts.
       *
       * @type {boolean|string}
       */
      keyboard: 'global',

      /**
       * Whether to allow mouse drag and touch swipe.
       *
       * @type {boolean}
       */
      drag: true,

      /**
       * The angle threshold for drag.
       * The slider starts moving only when the drag angle is less than this threshold.
       *
       * @type {number}
       */
      dragAngleThreshold: 30,

      /**
       * Distance threshold for determining if the action is "flick" or "swipe".
       * When a drag distance is over this value, the action will be treated as "swipe", not "flick".
       *
       * @type {number}
       */
      swipeDistanceThreshold: 150,

      /**
       * Velocity threshold for determining if the action is "flick" or "swipe".
       * Around 0.5 is recommended.
       *
       * @type {number}
       */
      flickVelocityThreshold: .6,

      /**
       * Determine power of flick. The larger number this is, the farther a slider runs by flick.
       * Around 500 is recommended.
       *
       * @type {number}
       */
      flickPower: 600,

      /**
       * Limit a number of pages to move by flick.
       *
       * @type {number}
       */
      flickMaxPages: 1,

      /**
       * Slider direction.
       * - 'ltr': Left to right.
       * - 'rtl': Right to left.
       * - 'ttb': Top to bottom.
       *
       * @type {string}
       */
      direction: 'ltr',

      /**
       * Set img src to background-image of its parent element.
       * Images with various sizes can be displayed as same dimension without cropping work.
       * fixedHeight or heightRatio is required.
       *
       * @type {boolean}
       */
      cover: false,

      /**
       * Whether to enable accessibility(aria and screen reader texts) or not.
       *
       * @type {boolean}
       */
      accessibility: true,

      /**
       * Whether to add tabindex="0" to visible slides or not.
       *
       * @type {boolean}
       */
      slideFocus: true,

      /**
       * Determine if a slider is navigation for another.
       * Use "sync" API to synchronize two sliders.
       *
       * @type {boolean}
       */
      isNavigation: false,

      /**
       * Whether to trim spaces before the fist slide or after the last one when "focus" is not 0.
       *
       * @type {boolean}
       */
      trimSpace: true,

      /**
       * The "is-active" class is added after transition as default.
       * If true, it will be added before move.
       *
       * @type {boolean}
       */
      updateOnMove: false,

      /**
       * Throttle duration in milliseconds for the resize event.
       *
       * @type {number}
       */
      throttle: 100,

      /**
       * Whether to destroy a slider or not.
       *
       * @type {boolean}
       */
      destroy: false,

      /**
       * Options for specific breakpoints.
       *
       * @example
       * {
       *   1000: {
       *     perPage: 3,
       *     gap: 20
       *   },
       *   600: {
       *     perPage: 1,
       *     gap: 5,
       *   }
       * }
       *
       * @type {boolean|Object}
       */
      breakpoints: false,

      /**
       * Collection of class names.
       *
       * @see ./classes.js
       *
       * @type {Object}
       */
      classes: ELEMENT_CLASSES,

      /**
       * Collection of i18n texts.
       *
       * @see ./i18n.js
       *
       * @type {Object}
       */
      i18n: I18N
    };
    /**
     * Export state constants.
     *
     * @author    Naotoshi Fujita
     * @copyright Naotoshi Fujita. All rights reserved.
     */

    /**
     * Splide has been just created.
     *
     * @type {number}
     */
    var CREATED = 1;
    /**
     * All components have been mounted and initialized.
     *
     * @type {number}
     */

    var MOUNTED = 2;
    /**
     * Splide is ready for transition.
     *
     * @type {number}
     */

    var IDLE = 3;
    /**
     * Splide is moving.
     *
     * @type {number}
     */

    var MOVING = 4;
    /**
     * Splide is moving.
     *
     * @type {number}
     */

    var DESTROYED = 5;
    function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

    function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

    /**
     * The main class for applying Splide to an element.
     *
     * @author    Naotoshi Fujita
     * @copyright Naotoshi Fujita. All rights reserved.
     */








    /**
     * The main class for applying Splide to an element,
     * providing some APIs to control the behavior.
     */

    var Splide = /*#__PURE__*/function () {
      /**
       * Splide constructor.
       *
       * @throws {Error} When the given root element or selector is invalid.
       *
       * @param {Element|string}  root       - A selector for a root element or an element itself.
       * @param {Object}          options    - Optional. Options to change default behaviour.
       * @param {Object}          Components - Optional. Components.
       */
      function Splide(root, options, Components) {
        if (options === void 0) {
          options = {};
        }

        if (Components === void 0) {
          Components = {};
        }

        this.root = root instanceof Element ? root : document.querySelector(root);
        exist(this.root, 'An invalid element/selector was given.');
        this.Components = null;
        this.Event = core_event();
        this.State = state(CREATED);
        this.STATES = states_namespaceObject;
        this._o = merge(DEFAULTS, options);
        this._i = 0;
        this._c = Components;
        this._e = {}; // Extensions

        this._t = null; // Transition
      }
      /**
       * Compose and mount components.
       *
       * @param {Object}   Extensions - Optional. Additional components.
       * @param {function} Transition - Optional. Set a custom transition component.
       *
       * @return {Splide|undefined} - This instance or undefined if an exception occurred.
       */


      var _proto = Splide.prototype;

      _proto.mount = function mount(Extensions, Transition) {
        var _this = this;

        if (Extensions === void 0) {
          Extensions = this._e;
        }

        if (Transition === void 0) {
          Transition = this._t;
        }

        // Reset the state.
        this.State.set(CREATED);
        this._e = Extensions;
        this._t = Transition;
        this.Components = compose(this, merge(this._c, Extensions), Transition);

        try {
          each(this.Components, function (component, key) {
            var required = component.required;

            if (required === undefined || required) {
              component.mount && component.mount();
            } else {
              delete _this.Components[key];
            }
          });
        } catch (e) {
          error(e.message);
          return;
        }

        var State = this.State;
        State.set(MOUNTED);
        each(this.Components, function (component) {
          component.mounted && component.mounted();
        });
        this.emit('mounted');
        State.set(IDLE);
        this.emit('ready');
        applyStyle(this.root, {
          visibility: 'visible'
        });
        this.on('move drag', function () {
          return State.set(MOVING);
        }).on('moved dragged', function () {
          return State.set(IDLE);
        });
        return this;
      }
      /**
       * Set sync target.
       *
       * @param {Splide} splide - A Splide instance.
       *
       * @return {Splide} - This instance.
       */
      ;

      _proto.sync = function sync(splide) {
        this.sibling = splide;
        return this;
      }
      /**
       * Register callback fired on the given event(s).
       *
       * @param {string}   events  - An event name. Use space to separate multiple events.
       *                             Also, namespace is accepted by dot, such as 'resize.{namespace}'.
       * @param {function} handler - A callback function.
       * @param {Element}  elm     - Optional. Native event will be listened to when this arg is provided.
       * @param {Object}   options - Optional. Options for addEventListener.
       *
       * @return {Splide} - This instance.
       */
      ;

      _proto.on = function on(events, handler, elm, options) {
        if (elm === void 0) {
          elm = null;
        }

        if (options === void 0) {
          options = {};
        }

        this.Event.on(events, handler, elm, options);
        return this;
      }
      /**
       * Unsubscribe the given event.
       *
       * @param {string}  events - A event name.
       * @param {Element} elm    - Optional. removeEventListener() will be called when this arg is provided.
       *
       * @return {Splide} - This instance.
       */
      ;

      _proto.off = function off(events, elm) {
        if (elm === void 0) {
          elm = null;
        }

        this.Event.off(events, elm);
        return this;
      }
      /**
       * Emit an event.
       *
       * @param {string} event - An event name.
       * @param {*}      args  - Any number of arguments passed to handlers.
       */
      ;

      _proto.emit = function emit(event) {
        var _this$Event;

        for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
          args[_key - 1] = arguments[_key];
        }

        (_this$Event = this.Event).emit.apply(_this$Event, [event].concat(args));

        return this;
      }
      /**
       * Go to the slide specified by the given control.
       *
       * @param {string|number} control - A control pattern.
       * @param {boolean}       wait    - Optional. Whether to wait for transition.
       */
      ;

      _proto.go = function go(control, wait) {
        if (wait === void 0) {
          wait = this.options.waitForTransition;
        }

        if (this.State.is(IDLE) || this.State.is(MOVING) && !wait) {
          this.Components.Controller.go(control, false);
        }

        return this;
      }
      /**
       * Verify whether the slider type is the given one or not.
       *
       * @param {string} type - A slider type.
       *
       * @return {boolean} - True if the slider type is the provided type or false if not.
       */
      ;

      _proto.is = function is(type) {
        return type === this._o.type;
      }
      /**
       * Insert a slide.
       *
       * @param {Element|string} slide - A slide element to be added.
       * @param {number}         index - A slide will be added at the position.
       */
      ;

      _proto.add = function add(slide, index) {
        if (index === void 0) {
          index = -1;
        }

        this.Components.Elements.add(slide, index, this.refresh.bind(this));
        return this;
      }
      /**
       * Remove the slide designated by the index.
       *
       * @param {number} index - A slide index.
       */
      ;

      _proto.remove = function remove(index) {
        this.Components.Elements.remove(index);
        this.refresh();
        return this;
      }
      /**
       * Destroy all Slide objects and clones and recreate them again.
       */
      ;

      _proto.refresh = function refresh() {
        this.emit('refresh:before').emit('refresh').emit('resize');
        return this;
      }
      /**
       * Destroy the Splide.
       * "Completely" boolean is mainly for breakpoints.
       *
       * @param {boolean} completely - Destroy completely.
       */
      ;

      _proto.destroy = function destroy(completely) {
        var _this2 = this;

        if (completely === void 0) {
          completely = true;
        }

        // Postpone destroy because it should be done after mount.
        if (this.State.is(CREATED)) {
          this.on('ready', function () {
            return _this2.destroy(completely);
          });
          return;
        }

        values(this.Components).reverse().forEach(function (component) {
          component.destroy && component.destroy(completely);
        });
        this.emit('destroy', completely); // Destroy all event handlers, including ones for native events.

        this.Event.destroy();
        this.State.set(DESTROYED);
        return this;
      }
      /**
       * Return the current slide index.
       *
       * @return {number} - The current slide index.
       // */
      ;

      _createClass(Splide, [{
        key: "index",
        get: function get() {
          return this._i;
        }
        /**
         * Set the current slide index.
         *
         * @param {number|string} index - A new index.
         */
        ,
        set: function set(index) {
          this._i = parseInt(index);
        }
        /**
         * Return length of slides.
         * This is an alias of Elements.length.
         *
         * @return {number} - A number of slides.
         */

      }, {
        key: "length",
        get: function get() {
          return this.Components.Elements.length;
        }
        /**
         * Return options.
         *
         * @return {Object} - Options object.
         */

      }, {
        key: "options",
        get: function get() {
          return this._o;
        }
        /**
         * Set options with merging the given object to the current one.
         *
         * @param {Object} options - New options.
         */
        ,
        set: function set(options) {
          var created = this.State.is(CREATED);

          if (!created) {
            this.emit('update');
          }

          this._o = merge(this._o, options);

          if (!created) {
            this.emit('updated', this._o);
          }
        }
        /**
         * Return the class list.
         * This is an alias of Splide.options.classList.
         *
         * @return {Object} - An object containing all class list.
         */

      }, {
        key: "classes",
        get: function get() {
          return this._o.classes;
        }
        /**
         * Return the i18n strings.
         * This is an alias of Splide.options.i18n.
         *
         * @return {Object} - An object containing all i18n strings.
         */

      }, {
        key: "i18n",
        get: function get() {
          return this._o.i18n;
        }
      }]);

      return Splide;
    }();
    /**
     * The component for initializing options.
     *
     * @author    Naotoshi Fujita
     * @copyright Naotoshi Fujita. All rights reserved.
     */



    /**
     * The component for initializing options.
     *
     * @param {Splide} Splide - A Splide instance.
     *
     * @return {Object} - The component object.
     */

    /* harmony default export */ const options = (function (Splide) {
      /**
       * Retrieve options from the data attribute.
       * Note that IE10 doesn't support dataset property.
       *
       * @type {string}
       */
      var options = getAttribute(Splide.root, 'data-splide');

      if (options) {
        try {
          Splide.options = JSON.parse(options);
        } catch (e) {
          error(e.message);
        }
      }

      return {
        /**
         * Called when the component is mounted.
         */
        mount: function mount() {
          if (Splide.State.is(CREATED)) {
            Splide.index = Splide.options.start;
          }
        }
      };
    });
    /**
     * Enumerate slides from right to left.
     *
     * @type {string}
     */

    var RTL = 'rtl';
    /**
     * Enumerate slides in a col.
     *
     * @type {string}
     */

    var TTB = 'ttb';
    /**
     * The sub component for handling each slide.
     *
     * @author    Naotoshi Fujita
     * @copyright Naotoshi Fujita. All rights reserved.
     */






    /**
     * Events for restoring original styles.
     *
     * @type {string}
     */

    var STYLE_RESTORE_EVENTS = 'update.slide';
    /**
     * The sub component for handling each slide.
     *
     * @param {Splide}  Splide    - A Splide instance.
     * @param {number}  index     - An unique slide index.
     * @param {number}  realIndex - Clones should pass a real slide index.
     * @param {Element} slide     - A slide element.
     *
     * @return {Object} - The sub component object.
     */

    /* harmony default export */ const elements_slide = (function (Splide, index, realIndex, slide) {
      /**
       * Whether to update "is-active" class before or after transition.
       *
       * @type {boolean}
       */
      var updateOnMove = Splide.options.updateOnMove;
      /**
       * Events when the slide status is updated.
       * Append a namespace to remove listeners later.
       *
       * @type {string}
       */

      var STATUS_UPDATE_EVENTS = 'ready.slide updated.slide resized.slide moved.slide' + (updateOnMove ? ' move.slide' : '');
      /**
       * Slide sub component object.
       *
       * @type {Object}
       */

      var Slide = {
        /**
         * Slide element.
         *
         * @type {Element}
         */
        slide: slide,

        /**
         * Slide index.
         *
         * @type {number}
         */
        index: index,

        /**
         * Real index for clones.
         *
         * @type {number}
         */
        realIndex: realIndex,

        /**
         * Container element if available.
         *
         * @type {Element|undefined}
         */
        container: child(slide, Splide.classes.container),

        /**
         * Whether this is a cloned slide or not.
         *
         * @type {boolean}
         */
        isClone: realIndex > -1,

        /**
         * Called when the component is mounted.
         */
        mount: function mount() {
          var _this = this;

          if (!this.isClone) {
            slide.id = Splide.root.id + "-slide" + pad(index + 1);
          }

          Splide.on(STATUS_UPDATE_EVENTS, function () {
            return _this.update();
          }).on(STYLE_RESTORE_EVENTS, restoreStyles).on('click', function () {
            return Splide.emit('click', _this);
          }, slide);
          /*
           * Add "is-active" class to a clone element temporarily
           * and it will be removed on "moved" event.
           */

          if (updateOnMove) {
            Splide.on('move.slide', function (newIndex) {
              if (newIndex === realIndex) {
                _update(true, false);
              }
            });
          } // Make sure the slide is shown.


          applyStyle(slide, {
            display: ''
          }); // Hold the original styles.

          this.styles = getAttribute(slide, 'style') || '';
        },

        /**
         * Destroy.
         */
        destroy: function destroy() {
          Splide.off(STATUS_UPDATE_EVENTS).off(STYLE_RESTORE_EVENTS).off('click', slide);
          removeClass(slide, values(STATUS_CLASSES));
          restoreStyles();
          removeAttribute(this.container, 'style');
        },

        /**
         * Update active and visible status.
         */
        update: function update() {
          _update(this.isActive(), false);

          _update(this.isVisible(), true);
        },

        /**
         * Check whether this slide is active or not.
         *
         * @return {boolean} - True if the slide is active or false if not.
         */
        isActive: function isActive() {
          return Splide.index === index;
        },

        /**
         * Check whether this slide is visible in the viewport or not.
         *
         * @return {boolean} - True if the slide is visible or false if not.
         */
        isVisible: function isVisible() {
          var active = this.isActive();

          if (Splide.is(FADE) || active) {
            return active;
          }

          var ceil = Math.ceil;
          var trackRect = getRect(Splide.Components.Elements.track);
          var slideRect = getRect(slide);

          if (Splide.options.direction === TTB) {
            return trackRect.top <= slideRect.top && slideRect.bottom <= ceil(trackRect.bottom);
          }

          return trackRect.left <= slideRect.left && slideRect.right <= ceil(trackRect.right);
        },

        /**
         * Calculate how far this slide is from another slide and
         * return true if the distance is within the given number.
         *
         * @param {number} from   - Index of a target slide.
         * @param {number} within - True if the slide is within this number.
         *
         * @return {boolean} - True if the slide is within the number or false otherwise.
         */
        isWithin: function isWithin(from, within) {
          var diff = Math.abs(from - index);

          if (!Splide.is(SLIDE) && !this.isClone) {
            diff = Math.min(diff, Splide.length - diff);
          }

          return diff < within;
        }
      };
      /**
       * Update classes for activity or visibility.
       *
       * @param {boolean} active        - Is active/visible or not.
       * @param {boolean} forVisibility - Toggle classes for activity or visibility.
       */

      function _update(active, forVisibility) {
        var type = forVisibility ? 'visible' : 'active';
        var className = STATUS_CLASSES[type];

        if (active) {
          addClass(slide, className);
          Splide.emit("" + type, Slide);
        } else {
          if (hasClass(slide, className)) {
            removeClass(slide, className);
            Splide.emit("" + (forVisibility ? 'hidden' : 'inactive'), Slide);
          }
        }
      }
      /**
       * Restore the original styles.
       */


      function restoreStyles() {
        setAttribute(slide, 'style', Slide.styles);
      }

      return Slide;
    });
    /**
     * The component for main elements.
     *
     * @author    Naotoshi Fujita
     * @copyright Naotoshi Fujita. All rights reserved.
     */





    /**
     * The property name for UID stored in a window object.
     *
     * @type {string}
     */

    var UID_NAME = 'uid';
    /**
     * The component for main elements.
     *
     * @param {Splide} Splide     - A Splide instance.
     * @param {Object} Components - An object containing components.
     *
     * @return {Object} - The component object.
     */

    /* harmony default export */ const components_elements = (function (Splide, Components) {
      /**
       * Hold the root element.
       *
       * @type {Element}
       */
      var root = Splide.root;
      /**
       * Hold the class list.
       *
       * @type {Object}
       */

      var classes = Splide.classes;
      /**
       * Store Slide objects.
       *
       * @type {Array}
       */

      var Slides = [];
      /*
       * Assign unique ID to the root element if it doesn't have the one.
       * Note that IE doesn't support padStart() to fill the uid by 0.
       */

      if (!root.id) {
        window.splide = window.splide || {};
        var uid = window.splide[UID_NAME] || 0;
        window.splide[UID_NAME] = ++uid;
        root.id = "splide" + pad(uid);
      }
      /**
       * Elements component object.
       *
       * @type {Object}
       */


      var Elements = {
        /**
         * Called when the component is mounted.
         * Collect main elements and store them as member properties.
         */
        mount: function mount() {
          var _this = this;

          this.init();
          Splide.on('refresh', function () {
            _this.destroy();

            _this.init();
          }).on('updated', function () {
            removeClass(root, getClasses());
            addClass(root, getClasses());
          });
        },

        /**
         * Destroy.
         */
        destroy: function destroy() {
          Slides.forEach(function (Slide) {
            Slide.destroy();
          });
          Slides = [];
          removeClass(root, getClasses());
        },

        /**
         * Initialization.
         */
        init: function init() {
          var _this2 = this;

          collect();
          addClass(root, getClasses());
          this.slides.forEach(function (slide, index) {
            _this2.register(slide, index, -1);
          });
        },

        /**
         * Register a slide to create a Slide object and handle its behavior.
         *
         * @param {Element} slide     - A slide element.
         * @param {number}  index     - A unique index. This can be negative.
         * @param {number}  realIndex - A real index for clones. Set -1 for real slides.
         */
        register: function register(slide, index, realIndex) {
          var SlideObject = elements_slide(Splide, index, realIndex, slide);
          SlideObject.mount();
          Slides.push(SlideObject);
        },

        /**
         * Return the Slide object designated by the index.
         * Note that "find" is not supported by IE.
         *
         * @return {Object|undefined} - A Slide object if available. Undefined if not.
         */
        getSlide: function getSlide(index) {
          return Slides.filter(function (Slide) {
            return Slide.index === index;
          })[0];
        },

        /**
         * Return all Slide objects.
         *
         * @param {boolean} includeClones - Whether to include cloned slides or not.
         *
         * @return {Object[]} - Slide objects.
         */
        getSlides: function getSlides(includeClones) {
          return includeClones ? Slides : Slides.filter(function (Slide) {
            return !Slide.isClone;
          });
        },

        /**
         * Return Slide objects belonging to the given page.
         *
         * @param {number} page - A page number.
         *
         * @return {Object[]} - An array containing Slide objects.
         */
        getSlidesByPage: function getSlidesByPage(page) {
          var idx = Components.Controller.toIndex(page);
          var options = Splide.options;
          var max = options.focus !== false ? 1 : options.perPage;
          return Slides.filter(function (_ref) {
            var index = _ref.index;
            return idx <= index && index < idx + max;
          });
        },

        /**
         * Insert a slide to a slider.
         * Need to refresh Splide after adding a slide.
         *
         * @param {Node|string} slide    - A slide element to be added.
         * @param {number}      index    - A slide will be added at the position.
         * @param {Function}    callback - Called right after the slide is added to the DOM tree.
         */
        add: function add(slide, index, callback) {
          if (typeof slide === 'string') {
            slide = domify(slide);
          }

          if (slide instanceof Element) {
            var ref = this.slides[index]; // This will be removed in mount() of a Slide component.

            applyStyle(slide, {
              display: 'none'
            });

            if (ref) {
              before(slide, ref);
              this.slides.splice(index, 0, slide);
            } else {
              append(this.list, slide);
              this.slides.push(slide);
            }

            loaded(slide, function () {
              callback && callback(slide);
            });
          }
        },

        /**
         * Remove a slide from a slider.
         * Need to refresh Splide after removing a slide.
         *
         * @param index - Slide index.
         */
        remove: function remove(index) {
          dom_remove(this.slides.splice(index, 1)[0]);
        },

        /**
         * Trigger the provided callback for each Slide object.
         *
         * @param {Function} callback - A callback function. The first argument will be the Slide object.
         */
        each: function each(callback) {
          Slides.forEach(callback);
        },

        /**
         * Return slides length without clones.
         *
         * @return {number} - Slide length.
         */
        get length() {
          return this.slides.length;
        },

        /**
         * Return "SlideObjects" length including clones.
         *
         * @return {number} - Slide length including clones.
         */
        get total() {
          return Slides.length;
        }

      };
      /**
       * Collect elements.
       */

      function collect() {
        Elements.slider = child(root, classes.slider);
        Elements.track = find(root, "." + classes.track);
        Elements.list = child(Elements.track, classes.list);
        exist(Elements.track && Elements.list, 'Track or list was not found.');
        Elements.slides = children(Elements.list, classes.slide);
        var arrows = findParts(classes.arrows);
        Elements.arrows = {
          prev: find(arrows, "." + classes.prev),
          next: find(arrows, "." + classes.next)
        };
        var autoplay = findParts(classes.autoplay);
        Elements.bar = find(findParts(classes.progress), "." + classes.bar);
        Elements.play = find(autoplay, "." + classes.play);
        Elements.pause = find(autoplay, "." + classes.pause);
        Elements.track.id = Elements.track.id || root.id + "-track";
        Elements.list.id = Elements.list.id || root.id + "-list";
      }
      /**
       * Return class names for the root element.
       */


      function getClasses() {
        var rootClass = classes.root;
        var options = Splide.options;
        return [rootClass + "--" + options.type, rootClass + "--" + options.direction, options.drag ? rootClass + "--draggable" : '', options.isNavigation ? rootClass + "--nav" : '', STATUS_CLASSES.active];
      }
      /**
       * Find parts only from children of the root or track.
       *
       * @return {Element} - A found element or undefined.
       */


      function findParts(className) {
        return child(root, className) || child(Elements.slider, className);
      }

      return Elements;
    });
    /**
     * The component for controlling the track.
     *
     * @author    Naotoshi Fujita
     * @copyright Naotoshi Fujita. All rights reserved.
     */



    var floor = Math.floor;
    /**
     * The component for controlling the track.
     *
     * @param {Splide} Splide     - A Splide instance.
     * @param {Object} Components - An object containing components.
     *
     * @return {Object} - The component object.
     */

    /* harmony default export */ const controller = (function (Splide, Components) {
      /**
       * Store current options.
       *
       * @type {Object}
       */
      var options;
      /**
       * True if the slide is LOOP mode.
       *
       * @type {boolean}
       */

      var isLoop;
      /**
       * Controller component object.
       *
       * @type {Object}
       */

      var Controller = {
        /**
         * Called when the component is mounted.
         */
        mount: function mount() {
          options = Splide.options;
          isLoop = Splide.is(LOOP);
          bind();
        },

        /**
         * Make track run by the given control.
         * - "+{i}" : Increment the slide index by i.
         * - "-{i}" : Decrement the slide index by i.
         * - "{i}"  : Go to the slide whose index is i.
         * - ">"    : Go to next page.
         * - "<"    : Go to prev page.
         * - ">{i}" : Go to page i.
         *
         * @param {string|number} control  - A control pattern.
         * @param {boolean}       silently - Go to the destination without event emission.
         */
        go: function go(control, silently) {
          var destIndex = this.trim(this.parse(control));
          Components.Track.go(destIndex, this.rewind(destIndex), silently);
        },

        /**
         * Parse the given control and return the destination index for the track.
         *
         * @param {string} control - A control target pattern.
         *
         * @return {number} - A parsed target.
         */
        parse: function parse(control) {
          var index = Splide.index;
          var matches = String(control).match(/([+\-<>]+)(\d+)?/);
          var indicator = matches ? matches[1] : '';
          var number = matches ? parseInt(matches[2]) : 0;

          switch (indicator) {
            case '+':
              index += number || 1;
              break;

            case '-':
              index -= number || 1;
              break;

            case '>':
            case '<':
              index = parsePage(number, index, indicator === '<');
              break;

            default:
              index = parseInt(control);
          }

          return index;
        },

        /**
         * Compute index from the given page number.
         *
         * @param {number} page - Page number.
         *
         * @return {number} - A computed page number.
         */
        toIndex: function toIndex(page) {
          if (hasFocus()) {
            return page;
          }

          var length = Splide.length;
          var perPage = options.perPage;
          var index = page * perPage;
          index = index - (this.pageLength * perPage - length) * floor(index / length); // Adjustment for the last page.

          if (length - perPage <= index && index < length) {
            index = length - perPage;
          }

          return index;
        },

        /**
         * Compute page number from the given slide index.
         *
         * @param {number} index - Slide index.
         *
         * @return {number} - A computed page number.
         */
        toPage: function toPage(index) {
          if (hasFocus()) {
            return index;
          }

          var length = Splide.length;
          var perPage = options.perPage; // Make the last "perPage" number of slides belong to the last page.

          if (length - perPage <= index && index < length) {
            return floor((length - 1) / perPage);
          }

          return floor(index / perPage);
        },

        /**
         * Trim the given index according to the current mode.
         * Index being returned could be less than 0 or greater than the length in Loop mode.
         *
         * @param {number} index - An index being trimmed.
         *
         * @return {number} - A trimmed index.
         */
        trim: function trim(index) {
          if (!isLoop) {
            index = options.rewind ? this.rewind(index) : between(index, 0, this.edgeIndex);
          }

          return index;
        },

        /**
         * Rewind the given index if it's out of range.
         *
         * @param {number} index - An index.
         *
         * @return {number} - A rewound index.
         */
        rewind: function rewind(index) {
          var edge = this.edgeIndex;

          if (isLoop) {
            while (index > edge) {
              index -= edge + 1;
            }

            while (index < 0) {
              index += edge + 1;
            }
          } else {
            if (index > edge) {
              index = 0;
            } else if (index < 0) {
              index = edge;
            }
          }

          return index;
        },

        /**
         * Check if the direction is "rtl" or not.
         *
         * @return {boolean} - True if "rtl" or false if not.
         */
        isRtl: function isRtl() {
          return options.direction === RTL;
        },

        /**
         * Return the page length.
         *
         * @return {number} - Max page number.
         */
        get pageLength() {
          var length = Splide.length;
          return hasFocus() ? length : Math.ceil(length / options.perPage);
        },

        /**
         * Return the edge index.
         *
         * @return {number} - Edge index.
         */
        get edgeIndex() {
          var length = Splide.length;

          if (!length) {
            return 0;
          }

          if (hasFocus() || options.isNavigation || isLoop) {
            return length - 1;
          }

          return length - options.perPage;
        },

        /**
         * Return the index of the previous slide.
         *
         * @return {number} - The index of the previous slide if available. -1 otherwise.
         */
        get prevIndex() {
          var prev = Splide.index - 1;

          if (isLoop || options.rewind) {
            prev = this.rewind(prev);
          }

          return prev > -1 ? prev : -1;
        },

        /**
         * Return the index of the next slide.
         *
         * @return {number} - The index of the next slide if available. -1 otherwise.
         */
        get nextIndex() {
          var next = Splide.index + 1;

          if (isLoop || options.rewind) {
            next = this.rewind(next);
          }

          return Splide.index < next && next <= this.edgeIndex || next === 0 ? next : -1;
        }

      };
      /**
       * Listen to some events.
       */

      function bind() {
        Splide.on('move', function (newIndex) {
          Splide.index = newIndex;
        }).on('updated refresh', function (newOptions) {
          options = newOptions || options;
          Splide.index = between(Splide.index, 0, Controller.edgeIndex);
        });
      }
      /**
       * Verify if the focus option is available or not.
       *
       * @return {boolean} - True if a slider has the focus option.
       */


      function hasFocus() {
        return options.focus !== false;
      }
      /**
       * Return the next or previous page index computed by the page number and current index.
       *
       * @param {number}  number - Specify the page number.
       * @param {number}  index  - Current index.
       * @param {boolean} prev   - Prev or next.
       *
       * @return {number} - Slide index.
       */


      function parsePage(number, index, prev) {
        if (number > -1) {
          return Controller.toIndex(number);
        }

        var perMove = options.perMove;
        var sign = prev ? -1 : 1;

        if (perMove) {
          return index + perMove * sign;
        }

        return Controller.toIndex(Controller.toPage(index) + sign);
      }

      return Controller;
    });
    /**
     * The component for moving list in the track.
     *
     * @author    Naotoshi Fujita
     * @copyright Naotoshi Fujita. All rights reserved.
     */





    var abs = Math.abs;
    /**
     * The component for moving list in the track.
     *
     * @param {Splide} Splide     - A Splide instance.
     * @param {Object} Components - An object containing components.
     *
     * @return {Object} - The component object.
     */

    /* harmony default export */ const track = (function (Splide, Components) {
      /**
       * Hold the Layout component.
       *
       * @type {Object}
       */
      var Layout;
      /**
       * Hold the Layout component.
       *
       * @type {Object}
       */

      var Elements;
      /**
       * Store the list element.
       *
       * @type {Element}
       */

      var list;
      /**
       * Whether the current direction is vertical or not.
       *
       * @type {boolean}
       */

      var isVertical = Splide.options.direction === TTB;
      /**
       * Whether the slider type is FADE or not.
       *
       * @type {boolean}
       */

      var isFade = Splide.is(FADE);
      /**
       * Whether the slider direction is RTL or not.
       *
       * @type {boolean}
       */

      var isRTL = Splide.options.direction === RTL;
      /**
       * This will be true while transitioning from the last index to the first one.
       *
       * @type {boolean}
       */

      var isLoopPending = false;
      /**
       * Sign for the direction. Only RTL mode uses the positive sign.
       *
       * @type {number}
       */

      var sign = isRTL ? 1 : -1;
      /**
       * Track component object.
       *
       * @type {Object}
       */

      var Track = {
        /**
         * Make public the sign defined locally.
         *
         * @type {number}
         */
        sign: sign,

        /**
         * Called when the component is mounted.
         */
        mount: function mount() {
          Elements = Components.Elements;
          Layout = Components.Layout;
          list = Elements.list;
        },

        /**
         * Called after the component is mounted.
         * The resize event must be registered after the Layout's one is done.
         */
        mounted: function mounted() {
          var _this = this;

          if (!isFade) {
            this.jump(0);
            Splide.on('mounted resize updated', function () {
              _this.jump(Splide.index);
            });
          }
        },

        /**
         * Go to the given destination index.
         * After arriving there, the track is jump to the new index without animation, mainly for loop mode.
         *
         * @param {number}  destIndex - A destination index.
         *                              This can be negative or greater than slides length for reaching clones.
         * @param {number}  newIndex  - An actual new index. They are always same in Slide and Rewind mode.
         * @param {boolean} silently  - If true, suppress emitting events.
         */
        go: function go(destIndex, newIndex, silently) {
          var newPosition = getTrimmedPosition(destIndex);
          var prevIndex = Splide.index; // Prevent any actions while transitioning from the last index to the first one for jump.

          if (Splide.State.is(MOVING) && isLoopPending) {
            return;
          }

          isLoopPending = destIndex !== newIndex;

          if (!silently) {
            Splide.emit('move', newIndex, prevIndex, destIndex);
          }

          if (Math.abs(newPosition - this.position) >= 1 || isFade) {
            Components.Transition.start(destIndex, newIndex, prevIndex, this.toCoord(newPosition), function () {
              onTransitionEnd(destIndex, newIndex, prevIndex, silently);
            });
          } else {
            if (destIndex !== prevIndex && Splide.options.trimSpace === 'move') {
              Components.Controller.go(destIndex + destIndex - prevIndex, silently);
            } else {
              onTransitionEnd(destIndex, newIndex, prevIndex, silently);
            }
          }
        },

        /**
         * Move the track to the specified index.
         *
         * @param {number} index - A destination index where the track jumps.
         */
        jump: function jump(index) {
          this.translate(getTrimmedPosition(index));
        },

        /**
         * Set the list position by CSS translate property.
         *
         * @param {number} position - A new position value.
         */
        translate: function translate(position) {
          applyStyle(list, {
            transform: "translate" + (isVertical ? 'Y' : 'X') + "(" + position + "px)"
          });
        },

        /**
         * Cancel the transition and set the list position.
         * Also, loop the slider if necessary.
         */
        cancel: function cancel() {
          if (Splide.is(LOOP)) {
            this.shift();
          } else {
            // Ensure the current position.
            this.translate(this.position);
          }

          applyStyle(list, {
            transition: ''
          });
        },

        /**
         * Shift the slider if it exceeds borders on the edge.
         */
        shift: function shift() {
          var position = abs(this.position);
          var left = abs(this.toPosition(0));
          var right = abs(this.toPosition(Splide.length));
          var innerSize = right - left;

          if (position < left) {
            position += innerSize;
          } else if (position > right) {
            position -= innerSize;
          }

          this.translate(sign * position);
        },

        /**
         * Trim redundant spaces on the left or right edge if necessary.
         *
         * @param {number} position - Position value to be trimmed.
         *
         * @return {number} - Trimmed position.
         */
        trim: function trim(position) {
          if (!Splide.options.trimSpace || Splide.is(LOOP)) {
            return position;
          }

          var edge = sign * (Layout.totalSize() - Layout.size - Layout.gap);
          return between(position, edge, 0);
        },

        /**
         * Calculate the closest slide index from the given position.
         *
         * @param {number} position - A position converted to an slide index.
         *
         * @return {number} - The closest slide index.
         */
        toIndex: function toIndex(position) {
          var _this2 = this;

          var index = 0;
          var minDistance = Infinity;
          Elements.getSlides(true).forEach(function (Slide) {
            var slideIndex = Slide.index;
            var distance = abs(_this2.toPosition(slideIndex) - position);

            if (distance < minDistance) {
              minDistance = distance;
              index = slideIndex;
            }
          });
          return index;
        },

        /**
         * Return coordinates object by the given position.
         *
         * @param {number} position - A position value.
         *
         * @return {Object} - A coordinates object.
         */
        toCoord: function toCoord(position) {
          return {
            x: isVertical ? 0 : position,
            y: isVertical ? position : 0
          };
        },

        /**
         * Calculate the track position by a slide index.
         *
         * @param {number} index - Slide index.
         *
         * @return {Object} - Calculated position.
         */
        toPosition: function toPosition(index) {
          var position = Layout.totalSize(index) - Layout.slideSize(index) - Layout.gap;
          return sign * (position + this.offset(index));
        },

        /**
         * Return the current offset value, considering direction.
         *
         * @return {number} - Offset amount.
         */
        offset: function offset(index) {
          var focus = Splide.options.focus;
          var slideSize = Layout.slideSize(index);

          if (focus === 'center') {
            return -(Layout.size - slideSize) / 2;
          }

          return -(parseInt(focus) || 0) * (slideSize + Layout.gap);
        },

        /**
         * Return the current position.
         * This returns the correct position even while transitioning by CSS.
         *
         * @return {number} - Current position.
         */
        get position() {
          var prop = isVertical ? 'top' : isRTL ? 'right' : 'left';
          return getRect(list)[prop] - (getRect(Elements.track)[prop] - Layout.padding[prop] * sign);
        }

      };
      /**
       * Called whenever slides arrive at a destination.
       *
       * @param {number}  destIndex - A destination index.
       * @param {number}  newIndex  - A new index.
       * @param {number}  prevIndex - A previous index.
       * @param {boolean} silently  - If true, suppress emitting events.
       */

      function onTransitionEnd(destIndex, newIndex, prevIndex, silently) {
        applyStyle(list, {
          transition: ''
        });
        isLoopPending = false;

        if (!isFade) {
          Track.jump(newIndex);
        }

        if (!silently) {
          Splide.emit('moved', newIndex, prevIndex, destIndex);
        }
      }
      /**
       * Convert index to the trimmed position.
       *
       * @return {number} - Trimmed position.
       */


      function getTrimmedPosition(index) {
        return Track.trim(Track.toPosition(index));
      }

      return Track;
    });
    /**
     * The component for cloning some slides for "loop" mode of the track.
     *
     * @author    Naotoshi Fujita
     * @copyright Naotoshi Fujita. All rights reserved.
     */




    /**
     * The component for cloning some slides for "loop" mode of the track.
     *
     * @param {Splide} Splide     - A Splide instance.
     * @param {Object} Components - An object containing components.
     *
     * @return {Object} - The component object.
     */

    /* harmony default export */ const clones = (function (Splide, Components) {
      /**
       * Store information of all clones.
       *
       * @type {Array}
       */
      var clones = [];
      /**
       * Store the current clone count on one side.
       *
       * @type {number}
       */

      var cloneCount = 0;
      /**
       * Keep Elements component.
       *
       * @type {Object}
       */

      var Elements = Components.Elements;
      /**
       * Clones component object.
       *
       * @type {Object}
       */

      var Clones = {
        /**
         * Called when the component is mounted.
         */
        mount: function mount() {
          var _this = this;

          if (Splide.is(LOOP)) {
            init();
            Splide.on('refresh:before', function () {
              _this.destroy();
            }).on('refresh', init).on('resize', function () {
              if (cloneCount !== getCloneCount()) {
                // Destroy before refresh not to collect clones by the Elements component.
                _this.destroy();

                Splide.refresh();
              }
            });
          }
        },

        /**
         * Destroy.
         */
        destroy: function destroy() {
          dom_remove(clones);
          clones = [];
        },

        /**
         * Return all clones.
         *
         * @return {Element[]} - Cloned elements.
         */
        get clones() {
          return clones;
        },

        /**
         * Return clone length.
         *
         * @return {number} - A length of clones.
         */
        get length() {
          return clones.length;
        }

      };
      /**
       * Initialization.
       */

      function init() {
        Clones.destroy();
        cloneCount = getCloneCount();
        generateClones(cloneCount);
      }
      /**
       * Generate and append/prepend clones.
       *
       * @param {number} count - The half number of clones.
       */


      function generateClones(count) {
        var length = Elements.length,
            register = Elements.register;

        if (length) {
          var slides = Elements.slides;

          while (slides.length < count) {
            slides = slides.concat(slides);
          } // Clones after the last element.


          slides.slice(0, count).forEach(function (elm, index) {
            var clone = cloneDeeply(elm);
            append(Elements.list, clone);
            clones.push(clone);
            register(clone, index + length, index % length);
          }); // Clones before the first element.

          slides.slice(-count).forEach(function (elm, index) {
            var clone = cloneDeeply(elm);
            before(clone, slides[0]);
            clones.push(clone);
            register(clone, index - count, (length + index - count % length) % length);
          });
        }
      }
      /**
       * Return half count of clones to be generated.
       * Clone count is determined by:
       * - "clones" value in the options.
       * - Number of slides that can be placed in a view in "fixed" mode.
       * - Max pages a flick action can move.
       * - Whether the slide length is enough for perPage.
       *
       * @return {number} - Count for clones.
       */


      function getCloneCount() {
        var options = Splide.options;

        if (options.clones) {
          return options.clones;
        } // Use the slide length in autoWidth mode because the number cannot be calculated.


        var baseCount = options.autoWidth || options.autoHeight ? Elements.length : options.perPage;
        var dimension = options.direction === TTB ? 'Height' : 'Width';
        var fixedSize = toPixel(Splide.root, options["fixed" + dimension]);

        if (fixedSize) {
          // Roughly calculate the count. This needs not to be strict.
          baseCount = Math.ceil(Elements.track["client" + dimension] / fixedSize);
        }

        return baseCount * (options.drag ? options.flickMaxPages + 1 : 1);
      }
      /**
       * Clone deeply the given element.
       *
       * @param {Element} elm - An element being duplicated.
       *
       * @return {Node} - A cloned node(element).
       */


      function cloneDeeply(elm) {
        var clone = elm.cloneNode(true);
        addClass(clone, Splide.classes.clone); // ID should not be duplicated.

        removeAttribute(clone, 'id');
        return clone;
      }

      return Clones;
    });
    /**
     * The resolver component for horizontal layout.
     *
     * @author    Naotoshi Fujita
     * @copyright Naotoshi Fujita. All rights reserved.
     */



    /**
     * The resolver component for horizontal layout.
     *
     * @param {Splide} Splide     - A Splide instance.
     * @param {Object} Components - An object containing components.
     *
     * @return {Object} - The resolver object.
     */

    /* harmony default export */ const horizontal = (function (Splide, Components) {
      /**
       * Keep the Elements component.
       *
       * @type {string}
       */
      var Elements = Components.Elements;
      /**
       * Keep the root element.
       *
       * @type {Element}
       */

      var root = Splide.root;
      /**
       * Keep the track element.
       *
       * @type {Element}
       */

      var track;
      /**
       * Keep the latest options.
       *
       * @type {Element}
       */

      var options = Splide.options;
      return {
        /**
         * Margin property name.
         *
         * @type {string}
         */
        margin: 'margin' + (options.direction === RTL ? 'Left' : 'Right'),

        /**
         * Always 0 because the height will be determined by inner contents.
         *
         * @type {number}
         */
        height: 0,

        /**
         * Initialization.
         */
        init: function init() {
          this.resize();
        },

        /**
         * Resize gap and padding.
         * This must be called on init.
         */
        resize: function resize() {
          options = Splide.options;
          track = Elements.track;
          this.gap = toPixel(root, options.gap);
          var padding = options.padding;
          var left = toPixel(root, padding.left || padding);
          var right = toPixel(root, padding.right || padding);
          this.padding = {
            left: left,
            right: right
          };
          applyStyle(track, {
            paddingLeft: unit(left),
            paddingRight: unit(right)
          });
        },

        /**
         * Return total width from the left of the list to the right of the slide specified by the provided index.
         *
         * @param {number} index - Optional. A slide index. If undefined, total width of the slider will be returned.
         *
         * @return {number} - Total width to the right side of the specified slide, or 0 for an invalid index.
         */
        totalWidth: function totalWidth(index) {
          if (index === void 0) {
            index = Splide.length - 1;
          }

          var Slide = Elements.getSlide(index);
          var width = 0;

          if (Slide) {
            var slideRect = getRect(Slide.slide);
            var listRect = getRect(Elements.list);

            if (options.direction === RTL) {
              width = listRect.right - slideRect.left;
            } else {
              width = slideRect.right - listRect.left;
            }

            width += this.gap;
          }

          return width;
        },

        /**
         * Return the slide width in px.
         *
         * @param {number} index - Slide index.
         *
         * @return {number} - The slide width.
         */
        slideWidth: function slideWidth(index) {
          if (options.autoWidth) {
            var Slide = Elements.getSlide(index);
            return Slide ? Slide.slide.offsetWidth : 0;
          }

          var width = options.fixedWidth || (this.width + this.gap) / options.perPage - this.gap;
          return toPixel(root, width);
        },

        /**
         * Return the slide height in px.
         *
         * @return {number} - The slide height.
         */
        slideHeight: function slideHeight() {
          var height = options.height || options.fixedHeight || this.width * options.heightRatio;
          return toPixel(root, height);
        },

        /**
         * Return slider width without padding.
         *
         * @return {number} - Current slider width.
         */
        get width() {
          return track.clientWidth - this.padding.left - this.padding.right;
        }

      };
    });
    /**
     * The resolver component for vertical layout.
     *
     * @author    Naotoshi Fujita
     * @copyright Naotoshi Fujita. All rights reserved.
     */



    /**
     * The resolver component for vertical layout.
     *
     * @param {Splide} Splide     - A Splide instance.
     * @param {Object} Components - An object containing components.
     *
     * @return {Object} - The resolver object.
     */

    /* harmony default export */ const vertical = (function (Splide, Components) {
      /**
       * Keep the Elements component.
       *
       * @type {string}
       */
      var Elements = Components.Elements;
      /**
       * Keep the root element.
       *
       * @type {Element}
       */

      var root = Splide.root;
      /**
       * Keep the track element.
       *
       * @type {Element}
       */

      var track;
      /**
       * Keep the latest options.
       *
       * @type {Element}
       */

      var options;
      return {
        /**
         * Margin property name.
         *
         * @type {string}
         */
        margin: 'marginBottom',

        /**
         * Initialization.
         */
        init: function init() {
          this.resize();
        },

        /**
         * Resize gap and padding.
         * This must be called on init.
         */
        resize: function resize() {
          options = Splide.options;
          track = Elements.track;
          this.gap = toPixel(root, options.gap);
          var padding = options.padding;
          var top = toPixel(root, padding.top || padding);
          var bottom = toPixel(root, padding.bottom || padding);
          this.padding = {
            top: top,
            bottom: bottom
          };
          applyStyle(track, {
            paddingTop: unit(top),
            paddingBottom: unit(bottom)
          });
        },

        /**
         * Return total height from the top of the list to the bottom of the slide specified by the provided index.
         *
         * @param {number} index - Optional. A slide index. If undefined, total height of the slider will be returned.
         *
         * @return {number} - Total height to the bottom of the specified slide, or 0 for an invalid index.
         */
        totalHeight: function totalHeight(index) {
          if (index === void 0) {
            index = Splide.length - 1;
          }

          var Slide = Elements.getSlide(index);

          if (Slide) {
            return getRect(Slide.slide).bottom - getRect(Elements.list).top + this.gap;
          }

          return 0;
        },

        /**
         * Return the slide width in px.
         *
         * @return {number} - The slide width.
         */
        slideWidth: function slideWidth() {
          return toPixel(root, options.fixedWidth || this.width);
        },

        /**
         * Return the slide height in px.
         *
         * @param {number} index - Slide index.
         *
         * @return {number} - The slide height.
         */
        slideHeight: function slideHeight(index) {
          if (options.autoHeight) {
            var Slide = Elements.getSlide(index);
            return Slide ? Slide.slide.offsetHeight : 0;
          }

          var height = options.fixedHeight || (this.height + this.gap) / options.perPage - this.gap;
          return toPixel(root, height);
        },

        /**
         * Return slider width without padding.
         *
         * @return {number} - Current slider width.
         */
        get width() {
          return track.clientWidth;
        },

        /**
         * Return slide height without padding.
         *
         * @return {number} - Slider height.
         */
        get height() {
          var height = options.height || this.width * options.heightRatio;
          exist(height, '"height" or "heightRatio" is missing.');
          return toPixel(root, height) - this.padding.top - this.padding.bottom;
        }

      };
    });
    /**
     * A package of utility functions related with time.
     *
     * @author    Naotoshi Fujita
     * @copyright Naotoshi Fujita. All rights reserved.
     */

    /**
     * Simple throttle function that controls how often the given function is executed.
     *
     * @param {function} func - A function to be throttled.
     * @param {number}   wait - Time in millisecond for interval of execution.
     *
     * @return {Function} - A debounced function.
     */
    function throttle(func, wait) {
      var timeout; // Declare function by the "function" keyword to prevent "this" from being inherited.

      return function () {
        if (!timeout) {
          timeout = setTimeout(function () {
            func();
            timeout = null;
          }, wait);
        }
      };
    }
    /**
     * Custom setInterval function that provides progress rate as callback.
     *
     * @param {function} callback - A callback function fired every time the interval time passes.
     * @param {number}   interval - Interval duration in milliseconds.
     * @param {function} progress - A callback function fired whenever the progress goes.
     *
     * @return {Object} - An object containing play() and pause() functions.
     */

    function createInterval(callback, interval, progress) {
      var _window = window,
          requestAnimationFrame = _window.requestAnimationFrame;
      var start,
          elapse,
          rate,
          _pause = true;

      var step = function step(timestamp) {
        if (!_pause) {
          if (!start) {
            start = timestamp;

            if (rate && rate < 1) {
              start -= rate * interval;
            }
          }

          elapse = timestamp - start;
          rate = elapse / interval;

          if (elapse >= interval) {
            start = 0;
            rate = 1;
            callback();
          }

          if (progress) {
            progress(rate);
          }

          requestAnimationFrame(step);
        }
      };

      return {
        pause: function pause() {
          _pause = true;
          start = 0;
        },
        play: function play(reset) {
          start = 0;

          if (reset) {
            rate = 0;
          }

          if (_pause) {
            _pause = false;
            requestAnimationFrame(step);
          }
        }
      };
    }
    /**
     * The component for handing slide layouts and their sizes.
     *
     * @author    Naotoshi Fujita
     * @copyright Naotoshi Fujita. All rights reserved.
     */







    /**
     * The component for handing slide layouts and their sizes.
     *
     * @param {Splide} Splide     - A Splide instance.
     * @param {Object} Components - An object containing components.
     *
     * @return {Object} - The component object.
     */

    /* harmony default export */ const layout = (function (Splide, Components) {
      /**
       * Keep the Elements component.
       *
       * @type {string}
       */
      var Elements = Components.Elements;
      /**
       * Whether the slider is vertical or not.
       *
       * @type {boolean}
       */

      var isVertical = Splide.options.direction === TTB;
      /**
       * Layout component object.
       *
       * @type {Object}
       */

      var Layout = object_assign({
        /**
         * Called when the component is mounted.
         */
        mount: function mount() {
          bind();
          init(); // The word "size" means width for a horizontal slider and height for a vertical slider.

          this.totalSize = isVertical ? this.totalHeight : this.totalWidth;
          this.slideSize = isVertical ? this.slideHeight : this.slideWidth;
        },

        /**
         * Destroy the component.
         */
        destroy: function destroy() {
          removeAttribute([Elements.list, Elements.track], 'style');
        },

        /**
         * Return the slider height on the vertical mode or width on the horizontal mode.
         *
         * @return {number}
         */
        get size() {
          return isVertical ? this.height : this.width;
        }

      }, isVertical ? vertical(Splide, Components) : horizontal(Splide, Components));
      /**
       * Init slider styles according to options.
       */

      function init() {
        Layout.init();
        applyStyle(Splide.root, {
          maxWidth: unit(Splide.options.width)
        });
        Elements.each(function (Slide) {
          Slide.slide.style[Layout.margin] = unit(Layout.gap);
        });
        resize();
      }
      /**
       * Listen the resize native event with throttle.
       * Initialize when the component is mounted or options are updated.
       */


      function bind() {
        Splide.on('resize load', throttle(function () {
          Splide.emit('resize');
        }, Splide.options.throttle), window).on('resize', resize).on('updated refresh', init);
      }
      /**
       * Resize the track and slide elements.
       */


      function resize() {
        var options = Splide.options;
        Layout.resize();
        applyStyle(Elements.track, {
          height: unit(Layout.height)
        });
        var slideHeight = options.autoHeight ? null : unit(Layout.slideHeight());
        Elements.each(function (Slide) {
          applyStyle(Slide.container, {
            height: slideHeight
          });
          applyStyle(Slide.slide, {
            width: options.autoWidth ? null : unit(Layout.slideWidth(Slide.index)),
            height: Slide.container ? null : slideHeight
          });
        });
        Splide.emit('resized');
      }

      return Layout;
    });
    /**
     * The component for supporting mouse drag and swipe.
     *
     * @author    Naotoshi Fujita
     * @copyright Naotoshi Fujita. All rights reserved.
     */





    var drag_abs = Math.abs;
    /**
     * If the absolute velocity is greater thant this value,
     * a slider always goes to a different slide after drag, not allowed to stay on a current slide.
     */

    var MIN_VELOCITY = 0.1;
    /**
     * Adjust how much the track can be pulled on the first or last page.
     * The larger number this is, the farther the track moves.
     * This should be around 5 - 9.
     *
     * @type {number}
     */

    var FRICTION_REDUCER = 7;
    /**
     * The component supporting mouse drag and swipe.
     *
     * @param {Splide} Splide     - A Splide instance.
     * @param {Object} Components - An object containing components.
     *
     * @return {Object} - The component object.
     */

    /* harmony default export */ const drag = (function (Splide, Components) {
      /**
       * Store the Move component.
       *
       * @type {Object}
       */
      var Track = Components.Track;
      /**
       * Store the Controller component.
       *
       * @type {Object}
       */

      var Controller = Components.Controller;
      /**
       * Coordinate of the track on starting drag.
       *
       * @type {Object}
       */

      var startCoord;
      /**
       * Analyzed info on starting drag.
       *
       * @type {Object|null}
       */

      var startInfo;
      /**
       * Analyzed info being updated while dragging/swiping.
       *
       * @type {Object}
       */

      var currentInfo;
      /**
       * Determine whether slides are being dragged or not.
       *
       * @type {boolean}
       */

      var isDragging;
      /**
       * Whether the slider direction is vertical or not.
       *
       * @type {boolean}
       */

      var isVertical = Splide.options.direction === TTB;
      /**
       * Axis for the direction.
       *
       * @type {string}
       */

      var axis = isVertical ? 'y' : 'x';
      /**
       * Drag component object.
       *
       * @type {Object}
       */

      var Drag = {
        /**
         * Whether dragging is disabled or not.
         *
         * @type {boolean}
         */
        disabled: false,

        /**
         * Called when the component is mounted.
         */
        mount: function mount() {
          var _this = this;

          var Elements = Components.Elements;
          var track = Elements.track;
          Splide.on('touchstart mousedown', start, track).on('touchmove mousemove', move, track, {
            passive: false
          }).on('touchend touchcancel mouseleave mouseup dragend', end, track).on('mounted refresh', function () {
            // Prevent dragging an image or anchor itself.
            each(Elements.list.querySelectorAll('img, a'), function (elm) {
              Splide.off('dragstart', elm).on('dragstart', function (e) {
                e.preventDefault();
              }, elm, {
                passive: false
              });
            });
          }).on('mounted updated', function () {
            _this.disabled = !Splide.options.drag;
          });
        }
      };
      /**
       * Called when the track starts to be dragged.
       *
       * @param {TouchEvent|MouseEvent} e - TouchEvent or MouseEvent object.
       */

      function start(e) {
        if (!Drag.disabled && !isDragging) {
          // These prams are used to evaluate whether the slider should start moving.
          init(e);
        }
      }
      /**
       * Initialize parameters.
       *
       * @param {TouchEvent|MouseEvent} e - TouchEvent or MouseEvent object.
       */


      function init(e) {
        startCoord = Track.toCoord(Track.position);
        startInfo = analyze(e, {});
        currentInfo = startInfo;
      }
      /**
       * Called while the track being dragged.
       *
       * @param {TouchEvent|MouseEvent} e - TouchEvent or MouseEvent object.
       */


      function move(e) {
        if (startInfo) {
          currentInfo = analyze(e, startInfo);

          if (isDragging) {
            if (e.cancelable) {
              e.preventDefault();
            }

            if (!Splide.is(FADE)) {
              var position = startCoord[axis] + currentInfo.offset[axis];
              Track.translate(resist(position));
            }
          } else {
            if (shouldMove(currentInfo)) {
              Splide.emit('drag', startInfo);
              isDragging = true;
              Track.cancel(); // These params are actual drag data.

              init(e);
            }
          }
        }
      }
      /**
       * Determine whether to start moving the track or not by drag angle.
       *
       * @param {Object} info - An information object.
       *
       * @return {boolean} - True if the track should be moved or false if not.
       */


      function shouldMove(_ref) {
        var offset = _ref.offset;

        if (Splide.State.is(MOVING) && Splide.options.waitForTransition) {
          return false;
        }

        var angle = Math.atan(drag_abs(offset.y) / drag_abs(offset.x)) * 180 / Math.PI;

        if (isVertical) {
          angle = 90 - angle;
        }

        return angle < Splide.options.dragAngleThreshold;
      }
      /**
       * Resist dragging the track on the first/last page because there is no more.
       *
       * @param {number} position - A position being applied to the track.
       *
       * @return {Object} - Adjusted position.
       */


      function resist(position) {
        if (Splide.is(SLIDE)) {
          var sign = Track.sign;

          var _start = sign * Track.trim(Track.toPosition(0));

          var _end = sign * Track.trim(Track.toPosition(Controller.edgeIndex));

          position *= sign;

          if (position < _start) {
            position = _start - FRICTION_REDUCER * Math.log(_start - position);
          } else if (position > _end) {
            position = _end + FRICTION_REDUCER * Math.log(position - _end);
          }

          position *= sign;
        }

        return position;
      }
      /**
       * Called when dragging ends.
       */


      function end() {
        startInfo = null;

        if (isDragging) {
          Splide.emit('dragged', currentInfo);
          go(currentInfo);
          isDragging = false;
        }
      }
      /**
       * Go to the slide determined by the analyzed data.
       *
       * @param {Object} info - An info object.
       */


      function go(info) {
        var velocity = info.velocity[axis];
        var absV = drag_abs(velocity);

        if (absV > 0) {
          var options = Splide.options;
          var index = Splide.index;
          var sign = velocity < 0 ? -1 : 1;
          var destIndex = index;

          if (!Splide.is(FADE)) {
            var destination = Track.position;

            if (absV > options.flickVelocityThreshold && drag_abs(info.offset[axis]) < options.swipeDistanceThreshold) {
              destination += sign * Math.min(absV * options.flickPower, Components.Layout.size * (options.flickMaxPages || 1));
            }

            destIndex = Track.toIndex(destination);
          }
          /*
           * Do not allow the track to go to a previous position if there is enough velocity.
           * Always use the adjacent index for the fade mode.
           */


          if (destIndex === index && absV > MIN_VELOCITY) {
            destIndex = index + sign * Track.sign;
          }

          if (Splide.is(SLIDE)) {
            destIndex = between(destIndex, 0, Controller.edgeIndex);
          }

          Controller.go(destIndex, options.isNavigation);
        }
      }
      /**
       * Analyze the given event object and return important information for handling swipe behavior.
       *
       * @param {Event}   e          - Touch or Mouse event object.
       * @param {Object}  startInfo  - Information analyzed on start for calculating difference from the current one.
       *
       * @return {Object} - An object containing analyzed information, such as offset, velocity, etc.
       */


      function analyze(e, startInfo) {
        var timeStamp = e.timeStamp,
            touches = e.touches;

        var _ref2 = touches ? touches[0] : e,
            clientX = _ref2.clientX,
            clientY = _ref2.clientY;

        var _ref3 = startInfo.to || {},
            _ref3$x = _ref3.x,
            fromX = _ref3$x === void 0 ? clientX : _ref3$x,
            _ref3$y = _ref3.y,
            fromY = _ref3$y === void 0 ? clientY : _ref3$y;

        var startTime = startInfo.time || 0;
        var offset = {
          x: clientX - fromX,
          y: clientY - fromY
        };
        var duration = timeStamp - startTime;
        var velocity = {
          x: offset.x / duration,
          y: offset.y / duration
        };
        return {
          to: {
            x: clientX,
            y: clientY
          },
          offset: offset,
          time: timeStamp,
          velocity: velocity
        };
      }

      return Drag;
    });
    /**
     * The component for handling a click event.
     *
     * @author    Naotoshi Fujita
     * @copyright Naotoshi Fujita. All rights reserved.
     */

    /**
     * The component for handling a click event.
     * Click should be disabled during drag/swipe.
     *
     * @param {Splide} Splide     - A Splide instance.
     * @param {Object} Components - An object containing components.
     *
     * @return {Object} - The component object.
     */
    /* harmony default export */ const click = (function (Splide, Components) {
      /**
       * Whether click is disabled or not.
       *
       * @type {boolean}
       */
      var disabled = false;
      /**
       * Click component object.
       *
       * @type {Object}
       */

      var Click = {
        /**
         * Mount only when the drag is activated and the slide type is not "fade".
         *
         * @type {boolean}
         */
        required: Splide.options.drag,

        /**
         * Called when the component is mounted.
         */
        mount: function mount() {
          Splide.on('click', onClick, Components.Elements.track, {
            capture: true
          }).on('drag', function () {
            disabled = true;
          }).on('dragged', function () {
            // Make sure the flag is released after the click event is fired.
            setTimeout(function () {
              disabled = false;
            });
          });
        }
      };
      /**
       * Called when a track element is clicked.
       *
       * @param {Event} e - A click event.
       */

      function onClick(e) {
        if (disabled) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
        }
      }

      return Click;
    });
    /**
     * The component for playing slides automatically.
     *
     * @author    Naotoshi Fujita
     * @copyright Naotoshi Fujita. All rights reserved.
     */


    /**
     * Set of pause flags.
     */

    var PAUSE_FLAGS = {
      HOVER: 1,
      FOCUS: 2,
      MANUAL: 3
    };
    /**
     * The component for playing slides automatically.
     *
     * @param {Splide} Splide     - A Splide instance.
     * @param {Object} Components - An object containing components.
     * @param {string} name       - A component name as a lowercase string.
     *
     * @return {Object} - The component object.
     */

    /* harmony default export */ const autoplay = (function (Splide, Components, name) {
      /**
       * Store pause flags.
       *
       * @type {Array}
       */
      var flags = [];
      /**
       * Store an interval object.
       *
       * @type {Object};
       */

      var interval;
      /**
       * Keep the Elements component.
       *
       * @type {string}
       */

      var Elements = Components.Elements;
      /**
       * Autoplay component object.
       *
       * @type {Object}
       */

      var Autoplay = {
        /**
         * Required only when the autoplay option is true.
         *
         * @type {boolean}
         */
        required: Splide.options.autoplay,

        /**
         * Called when the component is mounted.
         * Note that autoplay starts only if there are slides over perPage number.
         */
        mount: function mount() {
          var options = Splide.options;

          if (Elements.slides.length > options.perPage) {
            interval = createInterval(function () {
              Splide.go('>');
            }, options.interval, function (rate) {
              Splide.emit(name + ":playing", rate);

              if (Elements.bar) {
                applyStyle(Elements.bar, {
                  width: rate * 100 + "%"
                });
              }
            });
            bind();
            this.play();
          }
        },

        /**
         * Start autoplay.
         *
         * @param {number} flag - A pause flag to be removed.
         */
        play: function play(flag) {
          if (flag === void 0) {
            flag = 0;
          }

          flags = flags.filter(function (f) {
            return f !== flag;
          });

          if (!flags.length) {
            Splide.emit(name + ":play");
            interval.play(Splide.options.resetProgress);
          }
        },

        /**
         * Pause autoplay.
         * Note that Array.includes is not supported by IE.
         *
         * @param {number} flag - A pause flag to be added.
         */
        pause: function pause(flag) {
          if (flag === void 0) {
            flag = 0;
          }

          interval.pause();

          if (flags.indexOf(flag) === -1) {
            flags.push(flag);
          }

          if (flags.length === 1) {
            Splide.emit(name + ":pause");
          }
        }
      };
      /**
       * Listen some events.
       */

      function bind() {
        var options = Splide.options;
        var sibling = Splide.sibling;
        var elms = [Splide.root, sibling ? sibling.root : null];

        if (options.pauseOnHover) {
          switchOn(elms, 'mouseleave', PAUSE_FLAGS.HOVER, true);
          switchOn(elms, 'mouseenter', PAUSE_FLAGS.HOVER, false);
        }

        if (options.pauseOnFocus) {
          switchOn(elms, 'focusout', PAUSE_FLAGS.FOCUS, true);
          switchOn(elms, 'focusin', PAUSE_FLAGS.FOCUS, false);
        }

        if (Elements.play) {
          Splide.on('click', function () {
            // Need to be removed a focus flag at first.
            Autoplay.play(PAUSE_FLAGS.FOCUS);
            Autoplay.play(PAUSE_FLAGS.MANUAL);
          }, Elements.play);
        }

        if (Elements.pause) {
          switchOn([Elements.pause], 'click', PAUSE_FLAGS.MANUAL, false);
        }

        Splide.on('move refresh', function () {
          Autoplay.play();
        }) // Rewind the timer.
        .on('destroy', function () {
          Autoplay.pause();
        });
      }
      /**
       * Play or pause on the given event.
       *
       * @param {Element[]} elms  - Elements.
       * @param {string}    event - An event name or names.
       * @param {number}    flag  - A pause flag defined on the top.
       * @param {boolean}   play  - Determine whether to play or pause.
       */


      function switchOn(elms, event, flag, play) {
        elms.forEach(function (elm) {
          Splide.on(event, function () {
            Autoplay[play ? 'play' : 'pause'](flag);
          }, elm);
        });
      }

      return Autoplay;
    });
    /**
     * The component for change an img element to background image of its wrapper.
     *
     * @author    Naotoshi Fujita
     * @copyright Naotoshi Fujita. All rights reserved.
     */

    /**
     * The component for change an img element to background image of its wrapper.
     *
     * @param {Splide} Splide     - A Splide instance.
     * @param {Object} Components - An object containing components.
     *
     * @return {Object} - The component object.
     */

    /* harmony default export */ const cover = (function (Splide, Components) {
      /**
       * Hold options.
       *
       * @type {Object}
       */
      var options = Splide.options;
      /**
       * Cover component object.
       *
       * @type {Object}
       */

      var Cover = {
        /**
         * Required only when "cover" option is true.
         *
         * @type {boolean}
         */
        required: options.cover,

        /**
         * Called when the component is mounted.
         */
        mount: function mount() {
          Splide.on('lazyload:loaded', function (img) {
            cover(img, false);
          });
          Splide.on('mounted updated refresh', function () {
            return apply(false);
          });
        },

        /**
         * Destroy.
         */
        destroy: function destroy() {
          apply(true);
        }
      };
      /**
       * Apply "cover" to all slides.
       *
       * @param {boolean} uncover - If true, "cover" will be clear.
       */

      function apply(uncover) {
        Components.Elements.each(function (Slide) {
          var img = child(Slide.slide, 'IMG') || child(Slide.container, 'IMG');

          if (img && img.src) {
            cover(img, uncover);
          }
        });
      }
      /**
       * Set background image of the parent element, using source of the given image element.
       *
       * @param {Element} img     - An image element.
       * @param {boolean} uncover - Reset "cover".
       */


      function cover(img, uncover) {
        applyStyle(img.parentElement, {
          background: uncover ? '' : "center/cover no-repeat url(\"" + img.src + "\")"
        });
        applyStyle(img, {
          display: uncover ? '' : 'none'
        });
      }

      return Cover;
    });
    /**
     * Export vector path for an arrow.
     *
     * @author    Naotoshi Fujita
     * @copyright Naotoshi Fujita. All rights reserved.
     */

    /**
     * Namespace definition for SVG element.
     *
     * @type {string}
     */
    var XML_NAME_SPACE = 'http://www.w3.org/2000/svg';
    /**
     * The arrow vector path.
     *
     * @type {number}
     */

    var PATH = 'm15.5 0.932-4.3 4.38 14.5 14.6-14.5 14.5 4.3 4.4 14.6-14.6 4.4-4.3-4.4-4.4-14.6-14.6z';
    /**
     * SVG width and height.
     *
     * @type {number}
     */

    var SIZE = 40;
    /**
     * The component for appending prev/next arrows.
     *
     * @author    Naotoshi Fujita
     * @copyright Naotoshi Fujita. All rights reserved.
     */



    /**
     * The component for appending prev/next arrows.
     *
     * @param {Splide} Splide     - A Splide instance.
     * @param {Object} Components - An object containing components.
     * @param {string} name       - A component name as a lowercase string.
     *
     * @return {Object} - The component object.
     */

    /* harmony default export */ const arrows = (function (Splide, Components, name) {
      /**
       * Previous arrow element.
       *
       * @type {Element|undefined}
       */
      var prev;
      /**
       * Next arrow element.
       *
       * @type {Element|undefined}
       */

      var next;
      /**
       * Store the class list.
       *
       * @type {Object}
       */

      var classes = Splide.classes;
      /**
       * Hold the root element.
       *
       * @type {Element}
       */

      var root = Splide.root;
      /**
       * Whether arrows are created programmatically or not.
       *
       * @type {boolean}
       */

      var created;
      /**
       * Hold the Elements component.
       *
       * @type {Object}
       */

      var Elements = Components.Elements;
      /**
       * Arrows component object.
       *
       * @type {Object}
       */

      var Arrows = {
        /**
         * Required when the arrows option is true.
         *
         * @type {boolean}
         */
        required: Splide.options.arrows,

        /**
         * Called when the component is mounted.
         */
        mount: function mount() {
          // Attempt to get arrows from HTML source.
          prev = Elements.arrows.prev;
          next = Elements.arrows.next; // If arrows were not found in HTML, let's generate them.

          if ((!prev || !next) && Splide.options.arrows) {
            prev = createArrow(true);
            next = createArrow(false);
            created = true;
            appendArrows();
          }

          if (prev && next) {
            bind();
          }

          this.arrows = {
            prev: prev,
            next: next
          };
        },

        /**
         * Called after all components are mounted.
         */
        mounted: function mounted() {
          Splide.emit(name + ":mounted", prev, next);
        },

        /**
         * Destroy.
         */
        destroy: function destroy() {
          removeAttribute([prev, next], 'disabled');

          if (created) {
            dom_remove(prev.parentElement);
          }
        }
      };
      /**
       * Listen to native and custom events.
       */

      function bind() {
        Splide.on('click', function () {
          Splide.go('<');
        }, prev).on('click', function () {
          Splide.go('>');
        }, next).on('mounted move updated refresh', updateDisabled);
      }
      /**
       * Update a disabled attribute.
       */


      function updateDisabled() {
        var _Components$Controlle = Components.Controller,
            prevIndex = _Components$Controlle.prevIndex,
            nextIndex = _Components$Controlle.nextIndex;
        var isEnough = Splide.length > Splide.options.perPage || Splide.is(LOOP);
        prev.disabled = prevIndex < 0 || !isEnough;
        next.disabled = nextIndex < 0 || !isEnough;
        Splide.emit(name + ":updated", prev, next, prevIndex, nextIndex);
      }
      /**
       * Create a wrapper element and append arrows.
       */


      function appendArrows() {
        var wrapper = create('div', {
          "class": classes.arrows
        });
        append(wrapper, prev);
        append(wrapper, next);
        var slider = Elements.slider;
        var parent = Splide.options.arrows === 'slider' && slider ? slider : root;
        before(wrapper, parent.firstElementChild);
      }
      /**
       * Create an arrow element.
       *
       * @param {boolean} prev - Determine to create a prev arrow or next arrow.
       *
       * @return {Element} - A created arrow element.
       */


      function createArrow(prev) {
        var arrow = "<button class=\"" + classes.arrow + " " + (prev ? classes.prev : classes.next) + "\" type=\"button\">" + ("<svg xmlns=\"" + XML_NAME_SPACE + "\"\tviewBox=\"0 0 " + SIZE + " " + SIZE + "\"\twidth=\"" + SIZE + "\"\theight=\"" + SIZE + "\">") + ("<path d=\"" + (Splide.options.arrowPath || PATH) + "\" />");
        return domify(arrow);
      }

      return Arrows;
    });
    /**
     * The component for handling pagination
     *
     * @author    Naotoshi Fujita
     * @copyright Naotoshi Fujita. All rights reserved.
     */


    /**
     * The event name for updating some attributes of pagination nodes.
     *
     * @type {string}
     */

    var ATTRIBUTES_UPDATE_EVENT = 'move.page';
    /**
     * The event name for recreating pagination.
     *
     * @type {string}
     */

    var UPDATE_EVENT = 'updated.page refresh.page';
    /**
     * The component for handling pagination
     *
     * @param {Splide} Splide     - A Splide instance.
     * @param {Object} Components - An object containing components.
     * @param {string} name       - A component name as a lowercase string.
     *
     * @return {Object} - The component object.
     */

    /* harmony default export */ const pagination = (function (Splide, Components, name) {
      /**
       * Store all data for pagination.
       * - list: A list element.
       * - items: An array that contains objects(li, button, index, page).
       *
       * @type {Object}
       */
      var data = {};
      /**
       * Hold the Elements component.
       *
       * @type {Object}
       */

      var Elements = Components.Elements;
      /**
       * Pagination component object.
       *
       * @type {Object}
       */

      var Pagination = {
        /**
         * Called when the component is mounted.
         */
        mount: function mount() {
          var pagination = Splide.options.pagination;

          if (pagination) {
            data = createPagination();
            var slider = Elements.slider;
            var parent = pagination === 'slider' && slider ? slider : Splide.root;
            append(parent, data.list);
            Splide.on(ATTRIBUTES_UPDATE_EVENT, updateAttributes);
          }

          Splide.off(UPDATE_EVENT).on(UPDATE_EVENT, function () {
            Pagination.destroy();

            if (Splide.options.pagination) {
              Pagination.mount();
              Pagination.mounted();
            }
          });
        },

        /**
         * Called after all components are mounted.
         */
        mounted: function mounted() {
          if (Splide.options.pagination) {
            var index = Splide.index;
            Splide.emit(name + ":mounted", data, this.getItem(index));
            updateAttributes(index, -1);
          }
        },

        /**
         * Destroy the pagination.
         * Be aware that node.remove() is not supported by IE.
         */
        destroy: function destroy() {
          dom_remove(data.list);

          if (data.items) {
            data.items.forEach(function (item) {
              Splide.off('click', item.button);
            });
          } // Do not remove UPDATE_EVENT to recreate pagination if needed.


          Splide.off(ATTRIBUTES_UPDATE_EVENT);
          data = {};
        },

        /**
         * Return an item by index.
         *
         * @param {number} index - A slide index.
         *
         * @return {Object|undefined} - An item object on success or undefined on failure.
         */
        getItem: function getItem(index) {
          return data.items[Components.Controller.toPage(index)];
        },

        /**
         * Return object containing pagination data.
         *
         * @return {Object} - Pagination data including list and items.
         */
        get data() {
          return data;
        }

      };
      /**
       * Update attributes.
       *
       * @param {number} index     - Active index.
       * @param {number} prevIndex - Prev index.
       */

      function updateAttributes(index, prevIndex) {
        var prev = Pagination.getItem(prevIndex);
        var curr = Pagination.getItem(index);
        var active = STATUS_CLASSES.active;

        if (prev) {
          removeClass(prev.button, active);
        }

        if (curr) {
          addClass(curr.button, active);
        }

        Splide.emit(name + ":updated", data, prev, curr);
      }
      /**
       * Create a wrapper and button elements.
       *
       * @return {Object} - An object contains all data.
       */


      function createPagination() {
        var options = Splide.options;
        var classes = Splide.classes;
        var list = create('ul', {
          "class": classes.pagination
        });
        var items = Elements.getSlides(false).filter(function (Slide) {
          return options.focus !== false || Slide.index % options.perPage === 0;
        }).map(function (Slide, page) {
          var li = create('li', {});
          var button = create('button', {
            "class": classes.page,
            type: 'button'
          });
          append(li, button);
          append(list, li);
          Splide.on('click', function () {
            Splide.go(">" + page);
          }, button);
          return {
            li: li,
            button: button,
            page: page,
            Slides: Elements.getSlidesByPage(page)
          };
        });
        return {
          list: list,
          items: items
        };
      }

      return Pagination;
    });
    /**
     * The component for loading slider images lazily.
     *
     * @author    Naotoshi Fujita
     * @copyright Naotoshi Fujita. All rights reserved.
     */



    /**
     * The name for a data attribute of src.
     *
     * @type {string}
     */

    var SRC_DATA_NAME = 'data-splide-lazy';
    /**
     * The name for a data attribute of srcset.
     *
     * @type {string}
     */

    var SRCSET_DATA_NAME = 'data-splide-lazy-srcset';
    /**
     * The component for loading slider images lazily.
     *
     * @param {Splide} Splide     - A Splide instance.
     * @param {Object} Components - An object containing components.
     * @param {string} name       - A component name as a lowercase string.
     *
     * @return {Object} - The component object.
     */

    /* harmony default export */ const lazyload = (function (Splide, Components, name) {
      /**
       * Next index for sequential loading.
       *
       * @type {number}
       */
      var nextIndex;
      /**
       * Store objects containing an img element and a Slide object.
       *
       * @type {Object[]}
       */

      var images;
      /**
       * Store the options.
       *
       * @type {Object}
       */

      var options = Splide.options;
      /**
       * Whether to load images sequentially or not.
       *
       * @type {boolean}
       */

      var isSequential = options.lazyLoad === 'sequential';
      /**
       * Lazyload component object.
       *
       * @type {Object}
       */

      var Lazyload = {
        /**
         * Mount only when the lazyload option is provided.
         *
         * @type {boolean}
         */
        required: options.lazyLoad,

        /**
         * Called when the component is mounted.
         */
        mount: function mount() {
          Splide.on('mounted refresh', function () {
            init();
            Components.Elements.each(function (Slide) {
              each(Slide.slide.querySelectorAll("[" + SRC_DATA_NAME + "], [" + SRCSET_DATA_NAME + "]"), function (img) {
                if (!img.src && !img.srcset) {
                  images.push({
                    img: img,
                    Slide: Slide
                  });
                  applyStyle(img, {
                    display: 'none'
                  });
                }
              });
            });

            if (isSequential) {
              loadNext();
            }
          });

          if (!isSequential) {
            Splide.on("mounted refresh moved." + name, check);
          }
        },

        /**
         * Destroy.
         */
        destroy: init
      };
      /**
       * Initialize parameters.
       */

      function init() {
        images = [];
        nextIndex = 0;
      }
      /**
       * Check how close each image is from the active slide and
       * determine whether to start loading or not, according to the distance.
       *
       * @param {number} index - Current index.
       */


      function check(index) {
        index = isNaN(index) ? Splide.index : index;
        images = images.filter(function (image) {
          if (image.Slide.isWithin(index, options.perPage * (options.preloadPages + 1))) {
            load(image.img, image.Slide);
            return false;
          }

          return true;
        }); // Unbind if all images are loaded.

        if (!images[0]) {
          Splide.off("moved." + name);
        }
      }
      /**
       * Start loading an image.
       * Creating a clone of the image element since setting src attribute directly to it
       * often occurs 'hitch', blocking some other processes of a browser.
       *
       * @param {Element} img   - An image element.
       * @param {Object}  Slide - A Slide object.
       */


      function load(img, Slide) {
        addClass(Slide.slide, STATUS_CLASSES.loading);
        var spinner = create('span', {
          "class": Splide.classes.spinner
        });
        append(img.parentElement, spinner);

        img.onload = function () {
          loaded(img, spinner, Slide, false);
        };

        img.onerror = function () {
          loaded(img, spinner, Slide, true);
        };

        setAttribute(img, 'srcset', getAttribute(img, SRCSET_DATA_NAME) || '');
        setAttribute(img, 'src', getAttribute(img, SRC_DATA_NAME) || '');
      }
      /**
       * Start loading a next image in images array.
       */


      function loadNext() {
        if (nextIndex < images.length) {
          var image = images[nextIndex];
          load(image.img, image.Slide);
        }

        nextIndex++;
      }
      /**
       * Called just after the image was loaded or loading was aborted by some error.
       *
       * @param {Element} img     - An image element.
       * @param {Element} spinner - A spinner element.
       * @param {Object}  Slide   - A Slide object.
       * @param {boolean} error   - True if the image was loaded successfully or false on error.
       */


      function loaded(img, spinner, Slide, error) {
        removeClass(Slide.slide, STATUS_CLASSES.loading);

        if (!error) {
          dom_remove(spinner);
          applyStyle(img, {
            display: ''
          });
          Splide.emit(name + ":loaded", img).emit('resize');
        }

        if (isSequential) {
          loadNext();
        }
      }

      return Lazyload;
    });
    /**
     * Export aria attribute names.
     *
     * @author    Naotoshi Fujita
     * @copyright Naotoshi Fujita. All rights reserved.
     */

    /**
     * Attribute name for aria-current.
     *
     * @type {string}
     */
    var ARIA_CURRENRT = 'aria-current';
    /**
     * Attribute name for aria-control.
     *
     * @type {string}
     */

    var ARIA_CONTROLS = 'aria-controls';
    /**
     * Attribute name for aria-control.
     *
     * @type {string}
     */

    var ARIA_LABEL = 'aria-label';
    /**
     * Attribute name for aria-hidden.
     *
     * @type {string}
     */

    var ARIA_HIDDEN = 'aria-hidden';
    /**
     * Attribute name for tab-index.
     *
     * @type {string}
     */

    var TAB_INDEX = 'tabindex';
    /**
     * The component for controlling slides via keyboard.
     *
     * @author    Naotoshi Fujita
     * @copyright Naotoshi Fujita. All rights reserved.
     */


    /**
     * Map a key to a slide control.
     *
     * @type {Object}
     */

    var KEY_MAP = {
      ltr: {
        ArrowLeft: '<',
        ArrowRight: '>',
        // For IE.
        Left: '<',
        Right: '>'
      },
      rtl: {
        ArrowLeft: '>',
        ArrowRight: '<',
        // For IE.
        Left: '>',
        Right: '<'
      },
      ttb: {
        ArrowUp: '<',
        ArrowDown: '>',
        // For IE.
        Up: '<',
        Down: '>'
      }
    };
    /**
     * The component for controlling slides via keyboard.
     *
     * @param {Splide} Splide - A Splide instance.
     *
     * @return {Object} - The component object.
     */

    /* harmony default export */ const keyboard = (function (Splide) {
      /**
       * Hold the target element.
       *
       * @type {Element|Document|undefined}
       */
      var target;
      return {
        /**
         * Called when the component is mounted.
         */
        mount: function mount() {
          Splide.on('mounted updated', function () {
            var options = Splide.options;
            var root = Splide.root;
            var map = KEY_MAP[options.direction];
            var keyboard = options.keyboard;

            if (target) {
              Splide.off('keydown', target);
              removeAttribute(root, TAB_INDEX);
            }

            if (keyboard) {
              if (keyboard === 'focused') {
                target = root;
                setAttribute(root, TAB_INDEX, 0);
              } else {
                target = document;
              }

              Splide.on('keydown', function (e) {
                if (map[e.key]) {
                  Splide.go(map[e.key]);
                }
              }, target);
            }
          });
        }
      };
    });
    /**
     * The component for enhancing accessibility.
     *
     * @author    Naotoshi Fujita
     * @copyright Naotoshi Fujita. All rights reserved.
     */



    /**
     * The component for enhancing accessibility.
     *
     * @param {Splide} Splide     - A Splide instance.
     * @param {Object} Components - An object containing components.
     *
     * @return {Object} - The component object.
     */

    /* harmony default export */ const a11y = (function (Splide, Components) {
      /**
       * Hold a i18n object.
       *
       * @type {Object}
       */
      var i18n = Splide.i18n;
      /**
       * Hold the Elements component.
       *
       * @type {Object}
       */

      var Elements = Components.Elements;
      /**
       * All attributes related with A11y.
       *
       * @type {string[]}
       */

      var allAttributes = [ARIA_HIDDEN, TAB_INDEX, ARIA_CONTROLS, ARIA_LABEL, ARIA_CURRENRT, 'role'];
      /**
       * A11y component object.
       *
       * @type {Object}
       */

      var A11y = {
        /**
         * Required only when the accessibility option is true.
         *
         * @type {boolean}
         */
        required: Splide.options.accessibility,

        /**
         * Called when the component is mounted.
         */
        mount: function mount() {
          Splide.on('visible', function (Slide) {
            updateSlide(Slide.slide, true);
          }).on('hidden', function (Slide) {
            updateSlide(Slide.slide, false);
          }).on('arrows:mounted', initArrows).on('arrows:updated', updateArrows).on('pagination:mounted', initPagination).on('pagination:updated', updatePagination).on('refresh', function () {
            removeAttribute(Components.Clones.clones, allAttributes);
          });

          if (Splide.options.isNavigation) {
            Splide.on('navigation:mounted navigation:updated', initNavigation).on('active', function (Slide) {
              updateNavigation(Slide, true);
            }).on('inactive', function (Slide) {
              updateNavigation(Slide, false);
            });
          }

          initAutoplay();
        },

        /**
         * Destroy.
         */
        destroy: function destroy() {
          var Arrows = Components.Arrows;
          var arrows = Arrows ? Arrows.arrows : {};
          removeAttribute(Elements.slides.concat([arrows.prev, arrows.next, Elements.play, Elements.pause]), allAttributes);
        }
      };
      /**
       * Update slide attributes when it gets visible or hidden.
       *
       * @param {Element} slide   - A slide element.
       * @param {Boolean} visible - True when the slide gets visible, or false when hidden.
       */

      function updateSlide(slide, visible) {
        setAttribute(slide, ARIA_HIDDEN, !visible);

        if (Splide.options.slideFocus) {
          setAttribute(slide, TAB_INDEX, visible ? 0 : -1);
        }
      }
      /**
       * Initialize arrows if they are available.
       * Append screen reader elements and add aria-controls attribute.
       *
       * @param {Element} prev - Previous arrow element.
       * @param {Element} next - Next arrow element.
       */


      function initArrows(prev, next) {
        var controls = Elements.track.id;
        setAttribute(prev, ARIA_CONTROLS, controls);
        setAttribute(next, ARIA_CONTROLS, controls);
      }
      /**
       * Update arrow attributes.
       *
       * @param {Element} prev      - Previous arrow element.
       * @param {Element} next      - Next arrow element.
       * @param {number}  prevIndex - Previous slide index or -1 when there is no precede slide.
       * @param {number}  nextIndex - Next slide index or -1 when there is no next slide.
       */


      function updateArrows(prev, next, prevIndex, nextIndex) {
        var index = Splide.index;
        var prevLabel = prevIndex > -1 && index < prevIndex ? i18n.last : i18n.prev;
        var nextLabel = nextIndex > -1 && index > nextIndex ? i18n.first : i18n.next;
        setAttribute(prev, ARIA_LABEL, prevLabel);
        setAttribute(next, ARIA_LABEL, nextLabel);
      }
      /**
       * Initialize pagination if it's available.
       * Append a screen reader element and add aria-controls/label attribute to each item.
       *
       * @param {Object} data       - Data object containing all items.
       * @param {Object} activeItem - An initial active item.
       */


      function initPagination(data, activeItem) {
        if (activeItem) {
          setAttribute(activeItem.button, ARIA_CURRENRT, true);
        }

        data.items.forEach(function (item) {
          var options = Splide.options;
          var text = options.focus === false && options.perPage > 1 ? i18n.pageX : i18n.slideX;
          var label = sprintf(text, item.page + 1);
          var button = item.button;
          var controls = item.Slides.map(function (Slide) {
            return Slide.slide.id;
          });
          setAttribute(button, ARIA_CONTROLS, controls.join(' '));
          setAttribute(button, ARIA_LABEL, label);
        });
      }
      /**
       * Update pagination attributes.
       *
       * @param {Object}  data - Data object containing all items.
       * @param {Element} prev - A previous active element.
       * @param {Element} curr - A current active element.
       */


      function updatePagination(data, prev, curr) {
        if (prev) {
          removeAttribute(prev.button, ARIA_CURRENRT);
        }

        if (curr) {
          setAttribute(curr.button, ARIA_CURRENRT, true);
        }
      }
      /**
       * Initialize autoplay buttons.
       */


      function initAutoplay() {
        ['play', 'pause'].forEach(function (name) {
          var elm = Elements[name];

          if (elm) {
            if (!isButton(elm)) {
              setAttribute(elm, 'role', 'button');
            }

            setAttribute(elm, ARIA_CONTROLS, Elements.track.id);
            setAttribute(elm, ARIA_LABEL, i18n[name]);
          }
        });
      }
      /**
       * Initialize navigation slider.
       * Add button role, aria-label, aria-controls to slide elements and append screen reader text to them.
       *
       * @param {Splide} main - A main Splide instance.
       */


      function initNavigation(main) {
        Elements.each(function (Slide) {
          var slide = Slide.slide;
          var realIndex = Slide.realIndex;

          if (!isButton(slide)) {
            setAttribute(slide, 'role', 'button');
          }

          var slideIndex = realIndex > -1 ? realIndex : Slide.index;
          var label = sprintf(i18n.slideX, slideIndex + 1);
          var mainSlide = main.Components.Elements.getSlide(slideIndex);
          setAttribute(slide, ARIA_LABEL, label);

          if (mainSlide) {
            setAttribute(slide, ARIA_CONTROLS, mainSlide.slide.id);
          }
        });
      }
      /**
       * Update navigation attributes.
       *
       * @param {Object}  Slide  - A target Slide object.
       * @param {boolean} active - True if the slide is active or false if inactive.
       */


      function updateNavigation(_ref, active) {
        var slide = _ref.slide;

        if (active) {
          setAttribute(slide, ARIA_CURRENRT, true);
        } else {
          removeAttribute(slide, ARIA_CURRENRT);
        }
      }
      /**
       * Check if the given element is button or not.
       *
       * @param {Element} elm - An element to be checked.
       *
       * @return {boolean} - True if the given element is button.
       */


      function isButton(elm) {
        return elm.tagName === 'BUTTON';
      }

      return A11y;
    });
    /**
     * The component for synchronizing a slider with another.
     *
     * @author    Naotoshi Fujita
     * @copyright Naotoshi Fujita. All rights reserved.
     */


    /**
     * The event name for sync.
     *
     * @type {string}
     */

    var SYNC_EVENT = 'move.sync';
    /**
     * The event names for click navigation.
     * @type {string}
     */

    var CLICK_EVENTS = 'mouseup touchend';
    /**
     * The keys for triggering the navigation button.
     *
     * @type {String[]}
     */

    var TRIGGER_KEYS = [' ', 'Enter', 'Spacebar'];
    /**
     * The component for synchronizing a slider with another.
     *
     * @param {Splide} Splide - A Splide instance.
     *
     * @return {Object} - The component object.
     */

    /* harmony default export */ const sync = (function (Splide) {
      /**
       * Keep the sibling Splide instance.
       *
       * @type {Splide}
       */
      var sibling = Splide.sibling;
      /**
       * Whether the sibling slider is navigation or not.
       *
       * @type {Splide|boolean}
       */

      var isNavigation = sibling && sibling.options.isNavigation;
      /**
       * Layout component object.
       *
       * @type {Object}
       */

      var Sync = {
        /**
         * Required only when the sub slider is available.
         *
         * @type {boolean}
         */
        required: !!sibling,

        /**
         * Called when the component is mounted.
         */
        mount: function mount() {
          syncMain();
          syncSibling();

          if (isNavigation) {
            bind();
            Splide.on('refresh', function () {
              setTimeout(function () {
                bind();
                sibling.emit('navigation:updated', Splide);
              });
            });
          }
        },

        /**
         * Called after all components are mounted.
         */
        mounted: function mounted() {
          if (isNavigation) {
            sibling.emit('navigation:mounted', Splide);
          }
        }
      };
      /**
       * Listen the primary slider event to move secondary one.
       * Must unbind a handler at first to avoid infinite loop.
       */

      function syncMain() {
        Splide.on(SYNC_EVENT, function (newIndex, prevIndex, destIndex) {
          sibling.off(SYNC_EVENT).go(sibling.is(LOOP) ? destIndex : newIndex, false);
          syncSibling();
        });
      }
      /**
       * Listen the secondary slider event to move primary one.
       * Must unbind a handler at first to avoid infinite loop.
       */


      function syncSibling() {
        sibling.on(SYNC_EVENT, function (newIndex, prevIndex, destIndex) {
          Splide.off(SYNC_EVENT).go(Splide.is(LOOP) ? destIndex : newIndex, false);
          syncMain();
        });
      }
      /**
       * Listen some events on each slide.
       */


      function bind() {
        sibling.Components.Elements.each(function (_ref) {
          var slide = _ref.slide,
              index = _ref.index;

          /*
           * Listen mouseup and touchend events to handle click.
           */
          Splide.off(CLICK_EVENTS, slide).on(CLICK_EVENTS, function (e) {
            // Ignore a middle or right click.
            if (!e.button || e.button === 0) {
              moveSibling(index);
            }
          }, slide);
          /*
           * Subscribe keyup to handle Enter and Space key.
           * Note that Array.includes is not supported by IE.
           */

          Splide.off('keyup', slide).on('keyup', function (e) {
            if (TRIGGER_KEYS.indexOf(e.key) > -1) {
              e.preventDefault();
              moveSibling(index);
            }
          }, slide, {
            passive: false
          });
        });
      }
      /**
       * Move the sibling to the given index.
       * Need to check "IDLE" status because slides can be moving by Drag component.
       *
       * @param {number} index - Target index.
       */


      function moveSibling(index) {
        if (Splide.State.is(IDLE)) {
          sibling.go(index);
        }
      }

      return Sync;
    });
    /**
     * The component for updating options according to a current window width.
     *
     * @author    Naotoshi Fujita
     * @copyright Naotoshi Fujita. All rights reserved.
     */


    /**
     * Interval time for throttle.
     *
     * @type {number}
     */

    var THROTTLE = 50;
    /**
     * The component for updating options according to a current window width.
     *
     * @param {Splide} Splide - A Splide instance.
     *
     * @return {Object} - The component object.
     */

    /* harmony default export */ const breakpoints = (function (Splide) {
      /**
       * Store breakpoints.
       *
       * @type {Object|boolean}
       */
      var breakpoints = Splide.options.breakpoints;
      /**
       * The check function whose frequency of call is reduced.
       *
       * @type {Function}
       */

      var throttledCheck = throttle(check, THROTTLE);
      /**
       * Keep initial options.
       *
       * @type {Object}
       */

      var initialOptions;
      /**
       * An array containing objects of point and MediaQueryList.
       *
       * @type {Object[]}
       */

      var map = [];
      /**
       * Hold the previous breakpoint.
       *
       * @type {number|undefined}
       */

      var prevPoint;
      /**
       * Breakpoints component object.
       *
       * @type {Object}
       */

      var Breakpoints = {
        /**
         * Required only when the breakpoints definition is provided and browser supports matchMedia.
         *
         * @type {boolean}
         */
        required: breakpoints && matchMedia,

        /**
         * Called when the component is mounted.
         */
        mount: function mount() {
          map = Object.keys(breakpoints).sort(function (n, m) {
            return +n - +m;
          }).map(function (point) {
            return {
              point: point,
              mql: matchMedia("(max-width:" + point + "px)")
            };
          });
          /*
           * To keep monitoring resize event after destruction without "completely",
           * use native addEventListener instead of Splide.on.
           */

          this.destroy(true);
          addEventListener('resize', throttledCheck); // Keep initial options to apply them when no breakpoint matches.

          initialOptions = Splide.options;
          check();
        },

        /**
         * Destroy.
         *
         * @param {boolean} completely - Whether to destroy Splide completely.
         */
        destroy: function destroy(completely) {
          if (completely) {
            removeEventListener('resize', throttledCheck);
          }
        }
      };
      /**
       * Check the breakpoint.
       */

      function check() {
        var point = getPoint();

        if (point !== prevPoint) {
          prevPoint = point;
          var State = Splide.State;
          var options = breakpoints[point] || initialOptions;
          var destroy = options.destroy;

          if (destroy) {
            Splide.options = initialOptions;
            Splide.destroy(destroy === 'completely');
          } else {
            if (State.is(DESTROYED)) {
              Splide.mount();
            }

            Splide.options = options;
          }
        }
      }
      /**
       * Return the breakpoint matching current window width.
       * Note that Array.prototype.find is not supported by IE.
       *
       * @return {number|string} - A breakpoint as number or string. -1 if no point matches.
       */


      function getPoint() {
        var item = map.filter(function (item) {
          return item.mql.matches;
        })[0];
        return item ? item.point : -1;
      }

      return Breakpoints;
    });
    /**
     * Export components.
     *
     * @author    Naotoshi Fujita
     * @copyright Naotoshi Fujita. All rights reserved.
     */

















    var COMPLETE = {
      Options: options,
      Breakpoints: breakpoints,
      Controller: controller,
      Elements: components_elements,
      Track: track,
      Clones: clones,
      Layout: layout,
      Drag: drag,
      Click: click,
      Autoplay: autoplay,
      Cover: cover,
      Arrows: arrows,
      Pagination: pagination,
      LazyLoad: lazyload,
      Keyboard: keyboard,
      Sync: sync,
      A11y: a11y
    };
    function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

    /**
     * Export Splide class for import.
     *
     * @author    Naotoshi Fujita
     * @copyright Naotoshi Fujita. All rights reserved.
     */


    /**
     * Export Splide class for import from other projects.
     */

    var module_Splide = /*#__PURE__*/function (_Core) {
      _inheritsLoose(Splide, _Core);

      function Splide(root, options) {
        return _Core.call(this, root, options, COMPLETE) || this;
      }

      return Splide;
    }(Splide);



    /***/ })

    /******/ 	});
    /************************************************************************/
    /******/ 	// The module cache
    /******/ 	var __webpack_module_cache__ = {};
    /******/ 	
    /******/ 	// The require function
    /******/ 	function __webpack_require__(moduleId) {
    /******/ 		// Check if module is in cache
    /******/ 		if(__webpack_module_cache__[moduleId]) {
    /******/ 			return __webpack_module_cache__[moduleId].exports;
    /******/ 		}
    /******/ 		// Create a new module (and put it into the cache)
    /******/ 		var module = __webpack_module_cache__[moduleId] = {
    /******/ 			// no module.id needed
    /******/ 			// no module.loaded needed
    /******/ 			exports: {}
    /******/ 		};
    /******/ 	
    /******/ 		// Execute the module function
    /******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
    /******/ 	
    /******/ 		// Return the exports of the module
    /******/ 		return module.exports;
    /******/ 	}
    /******/ 	
    /************************************************************************/
    /******/ 	/* webpack/runtime/define property getters */
    /******/ 	(() => {
    /******/ 		// define getter functions for harmony exports
    /******/ 		__webpack_require__.d = (exports, definition) => {
    /******/ 			for(var key in definition) {
    /******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
    /******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
    /******/ 				}
    /******/ 			}
    /******/ 		};
    /******/ 	})();
    /******/ 	
    /******/ 	/* webpack/runtime/hasOwnProperty shorthand */
    /******/ 	(() => {
    /******/ 		__webpack_require__.o = (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop);
    /******/ 	})();
    /******/ 	
    /******/ 	/* webpack/runtime/make namespace object */
    /******/ 	(() => {
    /******/ 		// define __esModule on exports
    /******/ 		__webpack_require__.r = (exports) => {
    /******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
    /******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
    /******/ 			}
    /******/ 			Object.defineProperty(exports, '__esModule', { value: true });
    /******/ 		};
    /******/ 	})();
    /******/ 	
    /************************************************************************/
    /******/ 	// module exports must be returned from runtime so entry inlining is disabled
    /******/ 	// startup
    /******/ 	// Load entry module and return exports
    /******/ 	return __webpack_require__(311);
    /******/ })()
    ;
    });
    });

    var Splide = /*@__PURE__*/getDefaultExportFromCjs(splide_esm);

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    const notifications = writable([]);

    class NotificationAPI {
      /**
       * a method to abstract out notification types
       * @param {String} type type of notification
       * @param {String} msg notification message
       * @private
       */
      static _notify(type, msg) {
        notifications.update(val => {
          return [...val, {
            type, msg, pk: Symbol()
          }];
        });
      }

      static delete(pk) {
        notifications.update(val => {
          return val.filter(v => {
            return (v.pk != pk);
          });
        });
      }

      
      static alert(msg) {
        NotificationAPI._notify("alert", msg);
      }

      static success(msg) {
        NotificationAPI._notify("success", msg);
      }

      static warning(msg) {
        NotificationAPI._notify("warning", msg);
      }
    }

    /* src\components\notifications\Notification.svelte generated by Svelte v3.37.0 */
    const file$8 = "src\\components\\notifications\\Notification.svelte";

    function create_fragment$8(ctx) {
    	let div1;
    	let span0;
    	let t1;
    	let span1;
    	let t2;
    	let t3;
    	let div0;
    	let div1_class_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			span0 = element("span");
    			span0.textContent = "X";
    			t1 = space();
    			span1 = element("span");
    			t2 = text(/*msg*/ ctx[0]);
    			t3 = space();
    			div0 = element("div");
    			attr_dev(span0, "class", "dismiss svelte-ouygj1");
    			add_location(span0, file$8, 18, 4, 424);
    			add_location(span1, file$8, 19, 4, 504);
    			attr_dev(div0, "class", "not-progress svelte-ouygj1");
    			add_location(div0, file$8, 21, 4, 532);
    			attr_dev(div1, "class", div1_class_value = "notification " + /*type*/ ctx[1] + " svelte-ouygj1");
    			add_location(div1, file$8, 17, 0, 385);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, span0);
    			append_dev(div1, t1);
    			append_dev(div1, span1);
    			append_dev(span1, t2);
    			append_dev(div1, t3);
    			append_dev(div1, div0);
    			/*div0_binding*/ ctx[5](div0);

    			if (!mounted) {
    				dispose = listen_dev(span0, "click", /*click_handler*/ ctx[4], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*msg*/ 1) set_data_dev(t2, /*msg*/ ctx[0]);

    			if (dirty & /*type*/ 2 && div1_class_value !== (div1_class_value = "notification " + /*type*/ ctx[1] + " svelte-ouygj1")) {
    				attr_dev(div1, "class", div1_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			/*div0_binding*/ ctx[5](null);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Notification", slots, []);
    	let { msg } = $$props;
    	let { type } = $$props;
    	let { pk } = $$props;
    	let progress_bar_el;

    	onMount(() => {
    		//delete notification after 1 second
    		setTimeout(
    			() => {
    				NotificationAPI.delete(pk);
    			},
    			3000
    		);
    	});

    	const writable_props = ["msg", "type", "pk"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Notification> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => NotificationAPI.delete(pk);

    	function div0_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			progress_bar_el = $$value;
    			$$invalidate(3, progress_bar_el);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("msg" in $$props) $$invalidate(0, msg = $$props.msg);
    		if ("type" in $$props) $$invalidate(1, type = $$props.type);
    		if ("pk" in $$props) $$invalidate(2, pk = $$props.pk);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		NotificationAPI,
    		msg,
    		type,
    		pk,
    		progress_bar_el
    	});

    	$$self.$inject_state = $$props => {
    		if ("msg" in $$props) $$invalidate(0, msg = $$props.msg);
    		if ("type" in $$props) $$invalidate(1, type = $$props.type);
    		if ("pk" in $$props) $$invalidate(2, pk = $$props.pk);
    		if ("progress_bar_el" in $$props) $$invalidate(3, progress_bar_el = $$props.progress_bar_el);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [msg, type, pk, progress_bar_el, click_handler, div0_binding];
    }

    class Notification extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, { msg: 0, type: 1, pk: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Notification",
    			options,
    			id: create_fragment$8.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*msg*/ ctx[0] === undefined && !("msg" in props)) {
    			console.warn("<Notification> was created without expected prop 'msg'");
    		}

    		if (/*type*/ ctx[1] === undefined && !("type" in props)) {
    			console.warn("<Notification> was created without expected prop 'type'");
    		}

    		if (/*pk*/ ctx[2] === undefined && !("pk" in props)) {
    			console.warn("<Notification> was created without expected prop 'pk'");
    		}
    	}

    	get msg() {
    		throw new Error("<Notification>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set msg(value) {
    		throw new Error("<Notification>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get type() {
    		throw new Error("<Notification>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set type(value) {
    		throw new Error("<Notification>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get pk() {
    		throw new Error("<Notification>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set pk(value) {
    		throw new Error("<Notification>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\buttons\IconicButton.svelte generated by Svelte v3.37.0 */

    const { console: console_1$2 } = globals;
    const file$7 = "src\\components\\buttons\\IconicButton.svelte";

    function create_fragment$7(ctx) {
    	let button_1;
    	let span0;
    	let span0_class_value;
    	let t0;
    	let span1;
    	let t1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button_1 = element("button");
    			span0 = element("span");
    			t0 = space();
    			span1 = element("span");
    			t1 = text(/*text*/ ctx[1]);
    			attr_dev(span0, "class", span0_class_value = "fa fa-" + /*icon_class*/ ctx[0] + " btn-icon" + " svelte-1ah2ccf");
    			add_location(span0, file$7, 34, 4, 1037);
    			attr_dev(span1, "class", "btn-text svelte-1ah2ccf");
    			add_location(span1, file$7, 35, 4, 1092);
    			attr_dev(button_1, "class", "iconic-btn svelte-1ah2ccf");
    			attr_dev(button_1, "style", /*style*/ ctx[2]);
    			add_location(button_1, file$7, 33, 0, 962);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button_1, anchor);
    			append_dev(button_1, span0);
    			append_dev(button_1, t0);
    			append_dev(button_1, span1);
    			append_dev(span1, t1);
    			/*button_1_binding*/ ctx[5](button_1);

    			if (!mounted) {
    				dispose = listen_dev(button_1, "click", /*click_handler*/ ctx[4], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*icon_class*/ 1 && span0_class_value !== (span0_class_value = "fa fa-" + /*icon_class*/ ctx[0] + " btn-icon" + " svelte-1ah2ccf")) {
    				attr_dev(span0, "class", span0_class_value);
    			}

    			if (dirty & /*text*/ 2) set_data_dev(t1, /*text*/ ctx[1]);

    			if (dirty & /*style*/ 4) {
    				attr_dev(button_1, "style", /*style*/ ctx[2]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button_1);
    			/*button_1_binding*/ ctx[5](null);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("IconicButton", slots, []);
    	let { icon_class } = $$props;
    	let { text } = $$props;
    	let { style } = $$props;
    	let button;

    	function ripple(event) {
    		let { offsetX: x, offsetY: y } = event;
    		console.log(event);
    		let ripple_el = document.createElement("span");
    		ripple_el.style.backgroundColor = "rgba(255, 255, 255, 0.37)";
    		ripple_el.style.width = "1px";
    		ripple_el.style.height = "1px";
    		ripple_el.style.position = "absolute";
    		ripple_el.style.top = y + "px";
    		ripple_el.style.left = x + "px";
    		ripple_el.style.animation = "ripple_grow 250ms";
    		ripple_el.style.backgroundColor = "white";
    		ripple_el.style.borderRadius = "50%";
    		button.appendChild(ripple_el);

    		setTimeout(
    			() => {
    				ripple_el.remove();
    			},
    			300
    		);
    	}

    	onMount(() => {
    		button.addEventListener("click", ripple);
    	});

    	const writable_props = ["icon_class", "text", "style"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$2.warn(`<IconicButton> was created with unknown prop '${key}'`);
    	});

    	function click_handler(event) {
    		bubble($$self, event);
    	}

    	function button_1_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			button = $$value;
    			$$invalidate(3, button);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("icon_class" in $$props) $$invalidate(0, icon_class = $$props.icon_class);
    		if ("text" in $$props) $$invalidate(1, text = $$props.text);
    		if ("style" in $$props) $$invalidate(2, style = $$props.style);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		icon_class,
    		text,
    		style,
    		button,
    		ripple
    	});

    	$$self.$inject_state = $$props => {
    		if ("icon_class" in $$props) $$invalidate(0, icon_class = $$props.icon_class);
    		if ("text" in $$props) $$invalidate(1, text = $$props.text);
    		if ("style" in $$props) $$invalidate(2, style = $$props.style);
    		if ("button" in $$props) $$invalidate(3, button = $$props.button);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [icon_class, text, style, button, click_handler, button_1_binding];
    }

    class IconicButton extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, { icon_class: 0, text: 1, style: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "IconicButton",
    			options,
    			id: create_fragment$7.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*icon_class*/ ctx[0] === undefined && !("icon_class" in props)) {
    			console_1$2.warn("<IconicButton> was created without expected prop 'icon_class'");
    		}

    		if (/*text*/ ctx[1] === undefined && !("text" in props)) {
    			console_1$2.warn("<IconicButton> was created without expected prop 'text'");
    		}

    		if (/*style*/ ctx[2] === undefined && !("style" in props)) {
    			console_1$2.warn("<IconicButton> was created without expected prop 'style'");
    		}
    	}

    	get icon_class() {
    		throw new Error("<IconicButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set icon_class(value) {
    		throw new Error("<IconicButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get text() {
    		throw new Error("<IconicButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set text(value) {
    		throw new Error("<IconicButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<IconicButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<IconicButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\icons\SoroushIcon.svelte generated by Svelte v3.37.0 */

    const file$6 = "src\\components\\icons\\SoroushIcon.svelte";

    function create_fragment$6(ctx) {
    	let div;
    	let svg;
    	let g;
    	let path0;
    	let path1;

    	const block = {
    		c: function create() {
    			div = element("div");
    			svg = svg_element("svg");
    			g = svg_element("g");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			attr_dev(path0, "class", "sapp-w");
    			attr_dev(path0, "fill-rule", "evenodd");
    			attr_dev(path0, "clip-rule", "evenodd");
    			attr_dev(path0, "fill", "#525252");
    			attr_dev(path0, "d", "M965.063,1038.344v154.391l-129.883-74.219 \t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\tc-72.289,32.406-152.336,50.57-236.68,50.57c-320,0-579.414-259.422-579.414-579.414c0-320,259.414-579.406,579.414-579.406 \t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\tc319.992,0,579.406,259.406,579.406,579.406C1177.906,770.578,1094.961,932.078,965.063,1038.344z");
    			add_location(path0, file$6, 1, 251, 273);
    			attr_dev(path1, "fill-rule", "evenodd");
    			attr_dev(path1, "clip-rule", "evenodd");
    			attr_dev(path1, "class", "sapp_path");
    			attr_dev(path1, "fill", "#fff");
    			attr_dev(path1, "stroke", "#023E51");
    			attr_dev(path1, "stroke-width", "5");
    			attr_dev(path1, "stroke-miterlimit", "10");
    			attr_dev(path1, "d", " \t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\tM764.047,211.281c0,0-118.25,59.125-11.828,189.195c0,0,193.93,184.461,94.594,378.391c0,0-127.703,253.055-437.508,141.898 \t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\tc0,0-92.234-52.031-141.898-130.07c0,0,334.555,128.867,224.672-260.148c0,0-52.031-144.258,70.945-260.141 \t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\tC563.023,270.406,626.883,187.633,764.047,211.281z");
    			add_location(path1, file$6, 1, 644, 666);
    			add_location(g, file$6, 1, 231, 253);
    			attr_dev(svg, "version", "1.1");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "xmlns:xlink", "http://www.w3.org/1999/xlink");
    			attr_dev(svg, "x", "0px");
    			attr_dev(svg, "y", "0px");
    			attr_dev(svg, "width", "26px");
    			attr_dev(svg, "height", "26px");
    			attr_dev(svg, "viewBox", "0 0 1200 1200");
    			attr_dev(svg, "enable-background", "new 0 0 1200 1200");
    			attr_dev(svg, "xml:space", "preserve");
    			add_location(svg, file$6, 1, 4, 26);
    			attr_dev(div, "class", "p-icon");
    			add_location(div, file$6, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, svg);
    			append_dev(svg, g);
    			append_dev(g, path0);
    			append_dev(g, path1);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("SoroushIcon", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<SoroushIcon> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class SoroushIcon extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SoroushIcon",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* src\components\icons\RubikaIcon.svelte generated by Svelte v3.37.0 */

    const file$5 = "src\\components\\icons\\RubikaIcon.svelte";

    function create_fragment$5(ctx) {
    	let div;
    	let svg;
    	let g;
    	let path;

    	const block = {
    		c: function create() {
    			div = element("div");
    			svg = svg_element("svg");
    			g = svg_element("g");
    			path = svg_element("path");
    			attr_dev(path, "class", "roubika-path");
    			attr_dev(path, "fill-rule", "evenodd");
    			attr_dev(path, "clip-rule", "evenodd");
    			attr_dev(path, "fill", "#525252");
    			attr_dev(path, "d", "M140,144c-1.791-0.975-4,0-4,0l-40,23l-40-23 \t\t\tc0,0-2.042-0.719-3,0c-1.039,0.779-1,3-1,3v38c0,0,0.063,2.582,1,4c1.515,2.292,3,3,3,3s27.128,16.12,36,21c1.634,0.898,4,1,4,1 \t\t\ts2.897,0.234,5-1c8.719-5.117,29.419-17.085,37-22c1.639-1.063,3-4,3-4v-40C141,147,141.321,144.719,140,144z M4,105l34,20 \t\t\tc0,0,3.1,1.543,5,1c1.567-0.447,2-3,2-3V80l37-21c0,0,1.27-2.115,1-4c-0.227-1.589-2-3-2-3L44,31c0,0-1.209-1-2.438-1 \t\t\tC40.292,30,39,31,39,31L0,54v44c0,0-0.02,3.215,1,5C1.979,104.713,4,105,4,105z M190,1c0,0-1.5-1-3-1s-3,1-3,1l-39,23 \t\t\tc0,0-2.033,0.96-2,2c0.063,1.957,2,3,2,3l45,26v42c0,0-0.344,2.925,1,4c1.139,0.911,4,0,4,0l35-20c0,0,2.928-1.855,4-4 \t\t\tc0.915-1.83,1-5,1-5V29L190,1z M192,110c-0.978-0.488-3,0-3,0l-38,22c0,0-3.446,0.776-5,0c-1.442-0.721-1-4-1-4V82l-43-25 \t\t\tc0,0-1.749-1.745-2-3c-0.249-1.245,2-3,2-3l33-20c0,0,1.899-0.78,2-2c0.176-2.129-1-3-1-3L93,1c0,0-1.391-1-2.833-1 \t\t\tC88.613,0,87,1,87,1L48,24c0,0-1.754,1.473-1.507,2.959C46.746,28.473,49,30,49,30l37,22c0,0,1.733,1.462,2,3c0.607,3.499-2,5-2,5 \t\t\tL48,82v46c0,0,0.133,3.094-1,4c-1.348,1.078-4,0-4,0L5,110c0,0-1.673-0.796-3,0c-1.162,0.697-2,3-2,3v42c0,0-0.026,2.203,1,4 \t\t\tc0.972,1.701,3,3,3,3l39,23c0,0,1.814,0.712,3,0c1.308-0.785,2-3,2-3v-41c0,0-0.365-2.09,1-3c1.614-1.076,5,0,5,0l42,25l43-25 \t\t\tc0,0,2.578-0.474,4,0c1.571,0.523,2,3,2,3v40c0,0-0.054,1.946,1,3c0.939,0.939,3,1,3,1s1.046-0.423,2-1 \t\t\tc6.411-3.877,31.602-18.19,39-23c2.958-1.923,3-4,3-4v-45C193,112,193.021,110.511,192,110z");
    			add_location(path, file$5, 1, 249, 271);
    			add_location(g, file$5, 1, 237, 259);
    			attr_dev(svg, "version", "1.1");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "xmlns:xlink", "http://www.w3.org/1999/xlink");
    			attr_dev(svg, "x", "0px");
    			attr_dev(svg, "y", "0px");
    			attr_dev(svg, "width", "29px");
    			attr_dev(svg, "height", "26px");
    			attr_dev(svg, "viewBox", "0 0 235 214.018");
    			attr_dev(svg, "enable-background", "new 0 0 235 214.018");
    			attr_dev(svg, "xml:space", "preserve");
    			add_location(svg, file$5, 1, 4, 26);
    			attr_dev(div, "class", "p-icon");
    			add_location(div, file$5, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, svg);
    			append_dev(svg, g);
    			append_dev(g, path);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("RubikaIcon", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<RubikaIcon> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class RubikaIcon extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "RubikaIcon",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src\components\icons\VirgoolIcon.svelte generated by Svelte v3.37.0 */

    const file$4 = "src\\components\\icons\\VirgoolIcon.svelte";

    function create_fragment$4(ctx) {
    	let div;
    	let svg;
    	let style;
    	let t;
    	let filter;
    	let feOffset;
    	let feGaussianBlur;
    	let feColorMatrix;
    	let linearGradient;
    	let stop0;
    	let stop1;
    	let path0;
    	let g2;
    	let g0;
    	let path1;
    	let g1;
    	let path2;

    	const block = {
    		c: function create() {
    			div = element("div");
    			svg = svg_element("svg");
    			style = svg_element("style");
    			t = text(".st0{fill:url(#Shape_1_);}\r\n                        .st1{filter:url(#filter-3);}\r\n                        .st2{fill:#FFFFFF;}\r\n                      ");
    			filter = svg_element("filter");
    			feOffset = svg_element("feOffset");
    			feGaussianBlur = svg_element("feGaussianBlur");
    			feColorMatrix = svg_element("feColorMatrix");
    			linearGradient = svg_element("linearGradient");
    			stop0 = svg_element("stop");
    			stop1 = svg_element("stop");
    			path0 = svg_element("path");
    			g2 = svg_element("g");
    			g0 = svg_element("g");
    			path1 = svg_element("path");
    			g1 = svg_element("g");
    			path2 = svg_element("path");
    			attr_dev(style, "type", "text/css");
    			add_location(style, file$4, 2, 4, 82);
    			attr_dev(feOffset, "dx", "0");
    			attr_dev(feOffset, "dy", "1");
    			attr_dev(feOffset, "in", "SourceAlpha");
    			attr_dev(feOffset, "result", "shadowOffsetOuter1");
    			add_location(feOffset, file$4, 8, 4, 399);
    			attr_dev(feGaussianBlur, "in", "shadowOffsetOuter1");
    			attr_dev(feGaussianBlur, "result", "shadowBlurOuter1");
    			attr_dev(feGaussianBlur, "stdDeviation", "1.5");
    			add_location(feGaussianBlur, file$4, 9, 4, 485);
    			attr_dev(feColorMatrix, "in", "shadowBlurOuter1");
    			attr_dev(feColorMatrix, "type", "matrix");
    			attr_dev(feColorMatrix, "values", "0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.5 0");
    			add_location(feColorMatrix, file$4, 10, 4, 593);
    			attr_dev(filter, "filterUnits", "objectBoundingBox");
    			attr_dev(filter, "height", "200%");
    			attr_dev(filter, "id", "filter-3");
    			attr_dev(filter, "width", "200%");
    			attr_dev(filter, "x", "-50%");
    			attr_dev(filter, "y", "-50%");
    			add_location(filter, file$4, 7, 4, 294);
    			attr_dev(stop0, "offset", "0");
    			attr_dev(stop0, "class", "page_speed_1505877631");
    			add_location(stop0, file$4, 13, 4, 938);
    			attr_dev(stop1, "offset", "1");
    			attr_dev(stop1, "class", "page_speed_1021764917");
    			add_location(stop1, file$4, 14, 4, 998);
    			attr_dev(linearGradient, "id", "Shape_1_");
    			attr_dev(linearGradient, "gradientUnits", "userSpaceOnUse");
    			attr_dev(linearGradient, "x1", "-892.5724");
    			attr_dev(linearGradient, "y1", "1149.3007");
    			attr_dev(linearGradient, "x2", "-891.5724");
    			attr_dev(linearGradient, "y2", "1149.5884");
    			attr_dev(linearGradient, "gradientTransform", "matrix(203.0965 0 0 -275.684 181280.5781 317044.6562)");
    			add_location(linearGradient, file$4, 12, 4, 737);
    			attr_dev(path0, "id", "Shape");
    			attr_dev(path0, "class", "st0");
    			attr_dev(path0, "d", "M100.2,303.7c-16.2-11.1-32.1-22-48.5-33.2c9.9-13.9,19.7-27.4,29-40.4\r\n                                            c-10.1-4.2-20.5-7.2-29.4-12.7c-35.1-21.5-54-52.6-51-94.4c3.1-43.4,26.3-73.9,66.5-88.4c67.8-24.4,125,23.1,134.4,75.5\r\n                                            c4.1,22.8,1.9,45.2-10.4,65.1c-12.4,20.1-26.2,39.4-39.8,58.7c-15.6,22-31.7,43.7-47.5,65.5C102.6,300.6,101.7,301.8,100.2,303.7z");
    			add_location(path0, file$4, 16, 4, 1081);
    			attr_dev(path1, "id", "path-2_2_");
    			attr_dev(path1, "d", "M164.9,183.5c-11,0-21.8,0-32.9,0c0.2-9.5,0.4-49.1,0.6-58c-6,1.2-11.8,3.1-17.6,3.4\r\n                                                  c-23,1.2-41.5-7.3-53.3-27.5c-12.3-21-11.2-42.5,2.8-61.8c23.6-32.7,65.1-28.8,85.9-7.6c9.1,9.2,15.2,20.3,15.7,33.4\r\n                                                  c0.6,13.2,0.3,26.4,0.1,39.7");
    			add_location(path1, file$4, 21, 4, 1672);
    			attr_dev(g0, "class", "st1");
    			add_location(g0, file$4, 20, 4, 1651);
    			attr_dev(path2, "id", "path-2_1_");
    			attr_dev(path2, "class", "st2");
    			attr_dev(path2, "d", "M166.6,182.5c-11,0-21.8,0-32.9,0c0.2-9.5,0.4-49.1,0.6-58c-6,1.2-11.8,3.1-17.6,3.4\r\n                                                  c-23,1.2-41.5-7.3-53.3-27.5c-12.3-21-11.2-42.5,2.8-61.8c23.6-32.7,65.1-28.8,85.9-7.6c9.1,9.2,15.2,20.3,15.7,33.4\r\n                                                  c0.6,13.2,0.3,26.4,0.1,39.7");
    			add_location(path2, file$4, 26, 4, 2054);
    			add_location(g1, file$4, 25, 4, 2045);
    			attr_dev(g2, "id", "Fill-1");
    			attr_dev(g2, "transform", "translate(113.070063, 101.070415) rotate(210.000000) translate(-113.070063, -101.070415) ");
    			add_location(g2, file$4, 19, 4, 1528);
    			attr_dev(svg, "width", "35px");
    			attr_dev(svg, "height", "50px");
    			attr_dev(svg, "viewBox", "0 0 204 304");
    			add_location(svg, file$4, 1, 0, 22);
    			attr_dev(div, "class", "p-icon");
    			add_location(div, file$4, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, svg);
    			append_dev(svg, style);
    			append_dev(style, t);
    			append_dev(svg, filter);
    			append_dev(filter, feOffset);
    			append_dev(filter, feGaussianBlur);
    			append_dev(filter, feColorMatrix);
    			append_dev(svg, linearGradient);
    			append_dev(linearGradient, stop0);
    			append_dev(linearGradient, stop1);
    			append_dev(svg, path0);
    			append_dev(svg, g2);
    			append_dev(g2, g0);
    			append_dev(g0, path1);
    			append_dev(g2, g1);
    			append_dev(g1, path2);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("VirgoolIcon", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<VirgoolIcon> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class VirgoolIcon extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "VirgoolIcon",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src\components\static\Biography.svelte generated by Svelte v3.37.0 */

    const file$3 = "src\\components\\static\\Biography.svelte";

    function create_fragment$3(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "سلام؛ من اشکان هستم، یک برنامه نویس و توسعه دهنده که \r\n    به علوم داده و هوش مصنوعی هم علاقه داره. من به عنوان یک\r\n    برنامه نویس همیشه سعی می کنم دانش خودم رو با آخرین تکنولوژی \r\n    بروز نگه دارم و از آخرین استاندارد ها و اصول در انجام کار هام\r\n    استفاده کنم. می تونم تکنولوژی های جدید رو سریع یاد بگیرم\r\n    و خودم رو با اونها هماهنگ کنم. موقع انجام پروژه نیاز ها و\r\n    درخواست های مشتری در اولویت من هستند. نسبت به مشتری و شغلم تعهد دارم \r\n    و انجام به موقع کار ها جزء اصولی ترین وظایفم است.\r\n    دغدغه هر روز  من پیدا کردن مشکلات جامعه\r\n    و تلاش برای رفع اونها به وسیله ساخت نرم افزاره.\r\n    باور قلبی دارم که \"زکات علم نشر آن است\" \r\n    و دوست دارم باارائه دستاورد های علمی ام در قالب\r\n    مقالات آموزشی به بقیه کمک کنم. همچنین در اوقات فراغت به نویسندگی می پردازم";
    			add_location(span, file$3, 1, 0, 38);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Biography", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Biography> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Biography extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Biography",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src\components\cards\SkillCard.svelte generated by Svelte v3.37.0 */
    const file$2 = "src\\components\\cards\\SkillCard.svelte";
    const get_body_slot_changes = dirty => ({});
    const get_body_slot_context = ctx => ({});

    function create_fragment$2(ctx) {
    	let div;
    	let img;
    	let img_src_value;
    	let t0;
    	let main;
    	let t1;
    	let footer;
    	let iconicbutton;
    	let current;
    	const body_slot_template = /*#slots*/ ctx[3].body;
    	const body_slot = create_slot(body_slot_template, ctx, /*$$scope*/ ctx[2], get_body_slot_context);

    	iconicbutton = new IconicButton({
    			props: {
    				text: /*text*/ ctx[1],
    				icon_class: "angle-left",
    				style: "width: 250px; margin: auto; text-align: center"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			img = element("img");
    			t0 = space();
    			main = element("main");
    			if (body_slot) body_slot.c();
    			t1 = space();
    			footer = element("footer");
    			create_component(iconicbutton.$$.fragment);
    			if (img.src !== (img_src_value = "./img/" + /*vectorImg*/ ctx[0])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", /*vectorImg*/ ctx[0]);
    			attr_dev(img, "class", "svelte-y0eh1k");
    			add_location(img, file$2, 7, 4, 175);
    			attr_dev(main, "class", "body");
    			add_location(main, file$2, 8, 4, 226);
    			attr_dev(footer, "class", "svelte-y0eh1k");
    			add_location(footer, file$2, 11, 4, 299);
    			attr_dev(div, "class", "skill-card svelte-y0eh1k");
    			add_location(div, file$2, 6, 0, 145);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, img);
    			append_dev(div, t0);
    			append_dev(div, main);

    			if (body_slot) {
    				body_slot.m(main, null);
    			}

    			append_dev(div, t1);
    			append_dev(div, footer);
    			mount_component(iconicbutton, footer, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*vectorImg*/ 1 && img.src !== (img_src_value = "./img/" + /*vectorImg*/ ctx[0])) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (!current || dirty & /*vectorImg*/ 1) {
    				attr_dev(img, "alt", /*vectorImg*/ ctx[0]);
    			}

    			if (body_slot) {
    				if (body_slot.p && dirty & /*$$scope*/ 4) {
    					update_slot(body_slot, body_slot_template, ctx, /*$$scope*/ ctx[2], dirty, get_body_slot_changes, get_body_slot_context);
    				}
    			}

    			const iconicbutton_changes = {};
    			if (dirty & /*text*/ 2) iconicbutton_changes.text = /*text*/ ctx[1];
    			iconicbutton.$set(iconicbutton_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(body_slot, local);
    			transition_in(iconicbutton.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(body_slot, local);
    			transition_out(iconicbutton.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (body_slot) body_slot.d(detaching);
    			destroy_component(iconicbutton);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("SkillCard", slots, ['body']);
    	let { vectorImg = "" } = $$props;
    	let { text = "" } = $$props;
    	const writable_props = ["vectorImg", "text"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<SkillCard> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("vectorImg" in $$props) $$invalidate(0, vectorImg = $$props.vectorImg);
    		if ("text" in $$props) $$invalidate(1, text = $$props.text);
    		if ("$$scope" in $$props) $$invalidate(2, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ IconicButton, vectorImg, text });

    	$$self.$inject_state = $$props => {
    		if ("vectorImg" in $$props) $$invalidate(0, vectorImg = $$props.vectorImg);
    		if ("text" in $$props) $$invalidate(1, text = $$props.text);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [vectorImg, text, $$scope, slots];
    }

    class SkillCard extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { vectorImg: 0, text: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SkillCard",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get vectorImg() {
    		throw new Error("<SkillCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set vectorImg(value) {
    		throw new Error("<SkillCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get text() {
    		throw new Error("<SkillCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set text(value) {
    		throw new Error("<SkillCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\utils\Link.svelte generated by Svelte v3.37.0 */

    const { console: console_1$1 } = globals;
    const file$1 = "src\\components\\utils\\Link.svelte";

    function create_fragment$1(ctx) {
    	let span;
    	let t;
    	let input;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[5].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[4], null);

    	const block = {
    		c: function create() {
    			span = element("span");
    			if (default_slot) default_slot.c();
    			t = space();
    			input = element("input");
    			add_location(span, file$1, 21, 0, 571);
    			attr_dev(input, "type", "text");
    			set_style(input, "position", "fixed");
    			set_style(input, "opacity", "0");
    			set_style(input, "pointer-events", "none");
    			attr_dev(input, "name", "hin");
    			add_location(input, file$1, 25, 0, 678);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);

    			if (default_slot) {
    				default_slot.m(span, null);
    			}

    			insert_dev(target, t, anchor);
    			insert_dev(target, input, anchor);
    			/*input_binding*/ ctx[7](input);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(span, "click", /*click_handler*/ ctx[6], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 16) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[4], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			if (default_slot) default_slot.d(detaching);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(input);
    			/*input_binding*/ ctx[7](null);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Link", slots, ['default']);
    	let { addr = "" } = $$props;
    	let { action = "open" } = $$props;
    	let cpy_field;

    	function copy() {
    		// Todo: implement a notification system
    		NotificationAPI.success("ID کپی شد");

    		$$invalidate(2, cpy_field.value = addr, cpy_field);
    		cpy_field.select();
    		console.log(cpy_field);
    		document.execCommand("copy");
    		$$invalidate(2, cpy_field.style.display = "none", cpy_field);

    		setTimeout(
    			() => {
    				$$invalidate(2, cpy_field.style.display = "block", cpy_field);
    			},
    			200
    		);
    	}

    	const writable_props = ["addr", "action"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$1.warn(`<Link> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => action == "open" ? window.open(addr, "_blank") : copy();

    	function input_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			cpy_field = $$value;
    			$$invalidate(2, cpy_field);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("addr" in $$props) $$invalidate(0, addr = $$props.addr);
    		if ("action" in $$props) $$invalidate(1, action = $$props.action);
    		if ("$$scope" in $$props) $$invalidate(4, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		NotificationAPI,
    		addr,
    		action,
    		cpy_field,
    		copy
    	});

    	$$self.$inject_state = $$props => {
    		if ("addr" in $$props) $$invalidate(0, addr = $$props.addr);
    		if ("action" in $$props) $$invalidate(1, action = $$props.action);
    		if ("cpy_field" in $$props) $$invalidate(2, cpy_field = $$props.cpy_field);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [addr, action, cpy_field, copy, $$scope, slots, click_handler, input_binding];
    }

    class Link extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { addr: 0, action: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Link",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get addr() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set addr(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get action() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set action(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\App.svelte generated by Svelte v3.37.0 */

    const { console: console_1 } = globals;
    const file = "src\\App.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[12] = list[i];
    	return child_ctx;
    }

    // (99:1) {#each $notifications as n (n.pk)}
    function create_each_block(key_1, ctx) {
    	let div;
    	let notification;
    	let t;
    	let div_transition;
    	let rect;
    	let stop_animation = noop;
    	let current;

    	notification = new Notification({
    			props: {
    				type: /*n*/ ctx[12].type,
    				msg: /*n*/ ctx[12].msg,
    				pk: /*n*/ ctx[12].pk
    			},
    			$$inline: true
    		});

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			div = element("div");
    			create_component(notification.$$.fragment);
    			t = space();
    			add_location(div, file, 99, 2, 2420);
    			this.first = div;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(notification, div, null);
    			append_dev(div, t);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const notification_changes = {};
    			if (dirty & /*$notifications*/ 2) notification_changes.type = /*n*/ ctx[12].type;
    			if (dirty & /*$notifications*/ 2) notification_changes.msg = /*n*/ ctx[12].msg;
    			if (dirty & /*$notifications*/ 2) notification_changes.pk = /*n*/ ctx[12].pk;
    			notification.$set(notification_changes);
    		},
    		r: function measure() {
    			rect = div.getBoundingClientRect();
    		},
    		f: function fix() {
    			fix_position(div);
    			stop_animation();
    			add_transform(div, rect);
    		},
    		a: function animate() {
    			stop_animation();
    			stop_animation = create_animation(div, rect, flip, { duration: 500 });
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(notification.$$.fragment, local);

    			add_render_callback(() => {
    				if (!div_transition) div_transition = create_bidirectional_transition(div, fly, { duration: 500, x: 200 }, true);
    				div_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(notification.$$.fragment, local);
    			if (!div_transition) div_transition = create_bidirectional_transition(div, fly, { duration: 500, x: 200 }, false);
    			div_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(notification);
    			if (detaching && div_transition) div_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(99:1) {#each $notifications as n (n.pk)}",
    		ctx
    	});

    	return block;
    }

    // (112:3) <Link addr="@ashkan_mohammadi" action="copy">
    function create_default_slot_2(ctx) {
    	let span;
    	let soroushicon;
    	let current;
    	soroushicon = new SoroushIcon({ $$inline: true });

    	const block = {
    		c: function create() {
    			span = element("span");
    			create_component(soroushicon.$$.fragment);
    			attr_dev(span, "id", "s-icon");
    			set_style(span, "transform", "translateX(50px)");
    			attr_dev(span, "class", "svelte-1kagqgn");
    			add_location(span, file, 112, 4, 2805);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			mount_component(soroushicon, span, null);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(soroushicon.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(soroushicon.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			destroy_component(soroushicon);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2.name,
    		type: "slot",
    		source: "(112:3) <Link addr=\\\"@ashkan_mohammadi\\\" action=\\\"copy\\\">",
    		ctx
    	});

    	return block;
    }

    // (117:3) <Link addr="https://virgool.io/@mohammadiashkan1384">
    function create_default_slot_1(ctx) {
    	let span;
    	let virgoolicon;
    	let current;
    	virgoolicon = new VirgoolIcon({ $$inline: true });

    	const block = {
    		c: function create() {
    			span = element("span");
    			create_component(virgoolicon.$$.fragment);
    			attr_dev(span, "id", "v-icon");
    			attr_dev(span, "class", "svelte-1kagqgn");
    			add_location(span, file, 117, 4, 2971);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			mount_component(virgoolicon, span, null);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(virgoolicon.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(virgoolicon.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			destroy_component(virgoolicon);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(117:3) <Link addr=\\\"https://virgool.io/@mohammadiashkan1384\\\">",
    		ctx
    	});

    	return block;
    }

    // (122:3) <Link addr="@m_AshkanProgrammer" action="copy">
    function create_default_slot(ctx) {
    	let span;
    	let rubikaicon;
    	let current;
    	rubikaicon = new RubikaIcon({ $$inline: true });

    	const block = {
    		c: function create() {
    			span = element("span");
    			create_component(rubikaicon.$$.fragment);
    			attr_dev(span, "id", "r-icon");
    			set_style(span, "transform", "translateX(-50px)");
    			attr_dev(span, "class", "svelte-1kagqgn");
    			add_location(span, file, 122, 4, 3094);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			mount_component(rubikaicon, span, null);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(rubikaicon.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(rubikaicon.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			destroy_component(rubikaicon);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(122:3) <Link addr=\\\"@m_AshkanProgrammer\\\" action=\\\"copy\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let div0;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let t0;
    	let div5;
    	let header;
    	let div1;
    	let img;
    	let img_src_value;
    	let t1;
    	let div2;
    	let link0;
    	let t2;
    	let link1;
    	let t3;
    	let link2;
    	let t4;
    	let h10;
    	let t6;
    	let p;
    	let t8;
    	let div3;
    	let iconicbutton0;
    	let t9;
    	let iconicbutton1;
    	let t10;
    	let iconicbutton2;
    	let t11;
    	let section0;
    	let div4;
    	let biography;
    	let t12;
    	let section1;
    	let h11;
    	let t14;
    	let div7;
    	let div6;
    	let ul;
    	let li0;
    	let skillcard0;
    	let t15;
    	let li1;
    	let skillcard1;
    	let t16;
    	let li2;
    	let skillcard2;
    	let t17;
    	let section2;
    	let h12;
    	let t19;
    	let textarea;
    	let t20;
    	let input;
    	let t21;
    	let iconicbutton3;
    	let t22;
    	let footer;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value = /*$notifications*/ ctx[1];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*n*/ ctx[12].pk;
    	validate_each_keys(ctx, each_value, get_each_context, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block(key, child_ctx));
    	}

    	link0 = new Link({
    			props: {
    				addr: "@ashkan_mohammadi",
    				action: "copy",
    				$$slots: { default: [create_default_slot_2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	link1 = new Link({
    			props: {
    				addr: "https://virgool.io/@mohammadiashkan1384",
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	link2 = new Link({
    			props: {
    				addr: "@m_AshkanProgrammer",
    				action: "copy",
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	iconicbutton0 = new IconicButton({
    			props: {
    				text: "مقالات",
    				icon_class: "file-text",
    				style: "background-color: rgba(256, 256, 256, 0.3); color: rgb(32, 204, 147); border: 1px solid rgb(32, 204, 147);"
    			},
    			$$inline: true
    		});

    	iconicbutton0.$on("click", /*click_handler*/ ctx[3]);

    	iconicbutton1 = new IconicButton({
    			props: { text: "پروژه ها", icon_class: "tasks" },
    			$$inline: true
    		});

    	iconicbutton1.$on("click", /*click_handler_1*/ ctx[4]);

    	iconicbutton2 = new IconicButton({
    			props: {
    				text: "ارتباط با من",
    				icon_class: "phone-square"
    			},
    			$$inline: true
    		});

    	iconicbutton2.$on("click", /*click_handler_2*/ ctx[5]);
    	biography = new Biography({ $$inline: true });

    	skillcard0 = new SkillCard({
    			props: {
    				vectorImg: "Frontend.svg",
    				text: "توسعه Front-end"
    			},
    			$$inline: true
    		});

    	skillcard1 = new SkillCard({
    			props: {
    				vectorImg: "Backend.svg",
    				text: "توسعه Back-end"
    			},
    			$$inline: true
    		});

    	skillcard2 = new SkillCard({
    			props: {
    				vectorImg: "SoroushBot.svg",
    				text: "ساخت بات سوروش"
    			},
    			$$inline: true
    		});

    	iconicbutton3 = new IconicButton({
    			props: {
    				text: "ارسال",
    				icon_class: "send",
    				style: "\r\n\t\topacity: " + (/*feedback_txt*/ ctx[0] ? "1" : "0.30") + ";\r\n\t\tpointer-events: " + (/*feedback_txt*/ ctx[0] ? "all" : "none") + ";\r\n\t"
    			},
    			$$inline: true
    		});

    	iconicbutton3.$on("click", /*click_handler_3*/ ctx[7]);

    	const block = {
    		c: function create() {
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t0 = space();
    			div5 = element("div");
    			header = element("header");
    			div1 = element("div");
    			img = element("img");
    			t1 = space();
    			div2 = element("div");
    			create_component(link0.$$.fragment);
    			t2 = space();
    			create_component(link1.$$.fragment);
    			t3 = space();
    			create_component(link2.$$.fragment);
    			t4 = space();
    			h10 = element("h1");
    			h10.textContent = "اشکان محمدی";
    			t6 = space();
    			p = element("p");
    			p.textContent = "توسعه دهنده وب، علاقه مند به هوش مصنوعی و نویسندگی";
    			t8 = space();
    			div3 = element("div");
    			create_component(iconicbutton0.$$.fragment);
    			t9 = space();
    			create_component(iconicbutton1.$$.fragment);
    			t10 = space();
    			create_component(iconicbutton2.$$.fragment);
    			t11 = space();
    			section0 = element("section");
    			div4 = element("div");
    			create_component(biography.$$.fragment);
    			t12 = space();
    			section1 = element("section");
    			h11 = element("h1");
    			h11.textContent = "خدماتی که ارائه میدم";
    			t14 = space();
    			div7 = element("div");
    			div6 = element("div");
    			ul = element("ul");
    			li0 = element("li");
    			create_component(skillcard0.$$.fragment);
    			t15 = space();
    			li1 = element("li");
    			create_component(skillcard1.$$.fragment);
    			t16 = space();
    			li2 = element("li");
    			create_component(skillcard2.$$.fragment);
    			t17 = space();
    			section2 = element("section");
    			h12 = element("h1");
    			h12.textContent = "پیشنهاد، انتقاد یا درخواست همکاری داری؟";
    			t19 = space();
    			textarea = element("textarea");
    			t20 = space();
    			input = element("input");
    			t21 = space();
    			create_component(iconicbutton3.$$.fragment);
    			t22 = space();
    			footer = element("footer");
    			footer.textContent = "footer part";
    			attr_dev(div0, "class", "notification-box svelte-1kagqgn");
    			add_location(div0, file, 97, 0, 2349);
    			if (img.src !== (img_src_value = "./img/profile.jpg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "prof");
    			attr_dev(img, "class", "svelte-1kagqgn");
    			add_location(img, file, 108, 3, 2671);
    			attr_dev(div1, "class", "user-profile svelte-1kagqgn");
    			add_location(div1, file, 107, 2, 2640);
    			attr_dev(div2, "class", "link-list svelte-1kagqgn");
    			add_location(div2, file, 110, 2, 2726);
    			attr_dev(h10, "class", "title svelte-1kagqgn");
    			add_location(h10, file, 127, 2, 3210);
    			attr_dev(p, "class", "description svelte-1kagqgn");
    			add_location(p, file, 130, 2, 3257);
    			attr_dev(div3, "class", "btn-group svelte-1kagqgn");
    			add_location(div3, file, 133, 2, 3347);
    			attr_dev(header, "class", "header svelte-1kagqgn");
    			add_location(header, file, 106, 1, 2613);
    			attr_dev(div4, "class", "container rtl svelte-1kagqgn");
    			add_location(div4, file, 147, 2, 3845);
    			attr_dev(section0, "class", "green-box svelte-1kagqgn");
    			add_location(section0, file, 146, 1, 3814);
    			attr_dev(div5, "class", "main-grid svelte-1kagqgn");
    			add_location(div5, file, 105, 0, 2587);
    			attr_dev(h11, "align", "center");
    			attr_dev(h11, "class", "svelte-1kagqgn");
    			add_location(h11, file, 154, 1, 3937);
    			add_location(section1, file, 153, 0, 3925);
    			attr_dev(li0, "class", "splide__slide");
    			add_location(li0, file, 160, 3, 4081);
    			attr_dev(li1, "class", "splide__slide");
    			add_location(li1, file, 163, 3, 4189);
    			attr_dev(li2, "class", "splide__slide");
    			add_location(li2, file, 166, 3, 4295);
    			attr_dev(ul, "class", "splide__list");
    			add_location(ul, file, 159, 2, 4051);
    			attr_dev(div6, "class", "splide__track");
    			add_location(div6, file, 158, 1, 4020);
    			attr_dev(div7, "class", "splide");
    			add_location(div7, file, 157, 0, 3997);
    			attr_dev(h12, "align", "center");
    			attr_dev(h12, "class", "svelte-1kagqgn");
    			add_location(h12, file, 174, 1, 4459);
    			attr_dev(textarea, "placeholder", "همین جا مطرحش کن...");
    			attr_dev(textarea, "class", "svelte-1kagqgn");
    			add_location(textarea, file, 175, 1, 4525);
    			attr_dev(input, "type", "email");
    			attr_dev(input, "placeholder", "آدرس ایمیل");
    			attr_dev(input, "title", "جوابت رو از این طریق دریافت می کنی");
    			set_style(input, "width", "100%");
    			add_location(input, file, 176, 1, 4609);
    			attr_dev(section2, "id", "contact-form");
    			attr_dev(section2, "class", "svelte-1kagqgn");
    			add_location(section2, file, 173, 0, 4429);
    			set_style(footer, "margin-top", "100px");
    			set_style(footer, "color", "transparent");
    			add_location(footer, file, 187, 0, 4930);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			insert_dev(target, t0, anchor);
    			insert_dev(target, div5, anchor);
    			append_dev(div5, header);
    			append_dev(header, div1);
    			append_dev(div1, img);
    			append_dev(header, t1);
    			append_dev(header, div2);
    			mount_component(link0, div2, null);
    			append_dev(div2, t2);
    			mount_component(link1, div2, null);
    			append_dev(div2, t3);
    			mount_component(link2, div2, null);
    			append_dev(header, t4);
    			append_dev(header, h10);
    			append_dev(header, t6);
    			append_dev(header, p);
    			append_dev(header, t8);
    			append_dev(header, div3);
    			mount_component(iconicbutton0, div3, null);
    			append_dev(div3, t9);
    			mount_component(iconicbutton1, div3, null);
    			append_dev(div3, t10);
    			mount_component(iconicbutton2, div3, null);
    			append_dev(div5, t11);
    			append_dev(div5, section0);
    			append_dev(section0, div4);
    			mount_component(biography, div4, null);
    			insert_dev(target, t12, anchor);
    			insert_dev(target, section1, anchor);
    			append_dev(section1, h11);
    			insert_dev(target, t14, anchor);
    			insert_dev(target, div7, anchor);
    			append_dev(div7, div6);
    			append_dev(div6, ul);
    			append_dev(ul, li0);
    			mount_component(skillcard0, li0, null);
    			append_dev(ul, t15);
    			append_dev(ul, li1);
    			mount_component(skillcard1, li1, null);
    			append_dev(ul, t16);
    			append_dev(ul, li2);
    			mount_component(skillcard2, li2, null);
    			insert_dev(target, t17, anchor);
    			insert_dev(target, section2, anchor);
    			append_dev(section2, h12);
    			append_dev(section2, t19);
    			append_dev(section2, textarea);
    			set_input_value(textarea, /*feedback_txt*/ ctx[0]);
    			append_dev(section2, t20);
    			append_dev(section2, input);
    			append_dev(section2, t21);
    			mount_component(iconicbutton3, section2, null);
    			insert_dev(target, t22, anchor);
    			insert_dev(target, footer, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(textarea, "input", /*textarea_input_handler*/ ctx[6]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$notifications*/ 2) {
    				each_value = /*$notifications*/ ctx[1];
    				validate_each_argument(each_value);
    				group_outros();
    				for (let i = 0; i < each_blocks.length; i += 1) each_blocks[i].r();
    				validate_each_keys(ctx, each_value, get_each_context, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div0, fix_and_outro_and_destroy_block, create_each_block, null, get_each_context);
    				for (let i = 0; i < each_blocks.length; i += 1) each_blocks[i].a();
    				check_outros();
    			}

    			const link0_changes = {};

    			if (dirty & /*$$scope*/ 32768) {
    				link0_changes.$$scope = { dirty, ctx };
    			}

    			link0.$set(link0_changes);
    			const link1_changes = {};

    			if (dirty & /*$$scope*/ 32768) {
    				link1_changes.$$scope = { dirty, ctx };
    			}

    			link1.$set(link1_changes);
    			const link2_changes = {};

    			if (dirty & /*$$scope*/ 32768) {
    				link2_changes.$$scope = { dirty, ctx };
    			}

    			link2.$set(link2_changes);

    			if (dirty & /*feedback_txt*/ 1) {
    				set_input_value(textarea, /*feedback_txt*/ ctx[0]);
    			}

    			const iconicbutton3_changes = {};
    			if (dirty & /*feedback_txt*/ 1) iconicbutton3_changes.style = "\r\n\t\topacity: " + (/*feedback_txt*/ ctx[0] ? "1" : "0.30") + ";\r\n\t\tpointer-events: " + (/*feedback_txt*/ ctx[0] ? "all" : "none") + ";\r\n\t";
    			iconicbutton3.$set(iconicbutton3_changes);
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			transition_in(link0.$$.fragment, local);
    			transition_in(link1.$$.fragment, local);
    			transition_in(link2.$$.fragment, local);
    			transition_in(iconicbutton0.$$.fragment, local);
    			transition_in(iconicbutton1.$$.fragment, local);
    			transition_in(iconicbutton2.$$.fragment, local);
    			transition_in(biography.$$.fragment, local);
    			transition_in(skillcard0.$$.fragment, local);
    			transition_in(skillcard1.$$.fragment, local);
    			transition_in(skillcard2.$$.fragment, local);
    			transition_in(iconicbutton3.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			transition_out(link0.$$.fragment, local);
    			transition_out(link1.$$.fragment, local);
    			transition_out(link2.$$.fragment, local);
    			transition_out(iconicbutton0.$$.fragment, local);
    			transition_out(iconicbutton1.$$.fragment, local);
    			transition_out(iconicbutton2.$$.fragment, local);
    			transition_out(biography.$$.fragment, local);
    			transition_out(skillcard0.$$.fragment, local);
    			transition_out(skillcard1.$$.fragment, local);
    			transition_out(skillcard2.$$.fragment, local);
    			transition_out(iconicbutton3.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div5);
    			destroy_component(link0);
    			destroy_component(link1);
    			destroy_component(link2);
    			destroy_component(iconicbutton0);
    			destroy_component(iconicbutton1);
    			destroy_component(iconicbutton2);
    			destroy_component(biography);
    			if (detaching) detach_dev(t12);
    			if (detaching) detach_dev(section1);
    			if (detaching) detach_dev(t14);
    			if (detaching) detach_dev(div7);
    			destroy_component(skillcard0);
    			destroy_component(skillcard1);
    			destroy_component(skillcard2);
    			if (detaching) detach_dev(t17);
    			if (detaching) detach_dev(section2);
    			destroy_component(iconicbutton3);
    			if (detaching) detach_dev(t22);
    			if (detaching) detach_dev(footer);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function stage(interval, fnAction, step) {
    	console.log(step);
    	step = step == 0 ? interval : step;

    	setTimeout(
    		() => {
    			fnAction();
    		},
    		interval
    	);

    	return {
    		chain: next_action => {
    			return stage(interval + step, next_action, step);
    		}
    	};
    }

    function instance($$self, $$props, $$invalidate) {
    	let $notifications;
    	validate_store(notifications, "notifications");
    	component_subscribe($$self, notifications, $$value => $$invalidate(1, $notifications = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	let feedback_txt;

    	function playStartAnimation() {
    		anime({
    			targets: "#s-icon",
    			duration: 200,
    			translateX: "-=50px",
    			easing: "easeInOutSine"
    		});

    		anime({
    			targets: "#r-icon",
    			duration: 200,
    			translateX: "+=50px",
    			easing: "easeInOutSine"
    		});
    	}

    	function InitSliders() {
    		new Splide(".splide",
    		{
    				type: "slide",
    				perPage: 3,
    				focus: "center",
    				gap: "2rem",
    				pagination: false,
    				breakpoints: { "700": { perPage: 1 } }
    			}).mount();
    	}

    	function displayCards() {
    		anime({
    			targets: ".skill-card",
    			duration: 600,
    			opacity: 1
    		});
    	}

    	function displayWelcomeMessage() {
    		stage(
    			1000,
    			() => {
    				NotificationAPI.success("سلام؛ خوش آمدید!");
    			},
    			0
    		).chain(() => {
    			NotificationAPI.success("اشکان هستم؛ توسعه دهنده وب");
    		}).chain(() => {
    			NotificationAPI.success("خوشحالم که سری به وبسایت من زدید");
    		});
    	}

    	function renderPage() {
    		NotificationAPI.warning("درحال انجام مراحل تست و توسعه");
    	}

    	window.onscroll = event => {
    		if (window.scrollY > 380) displayCards();
    	};

    	onMount(() => {
    		playStartAnimation();
    		InitSliders();
    		displayWelcomeMessage();
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => renderPage();
    	const click_handler_1 = () => renderPage();
    	const click_handler_2 = () => renderPage();

    	function textarea_input_handler() {
    		feedback_txt = this.value;
    		$$invalidate(0, feedback_txt);
    	}

    	const click_handler_3 = () => renderPage();

    	$$self.$capture_state = () => ({
    		onMount,
    		flip,
    		fly,
    		anime,
    		Splide,
    		NotificationAPI,
    		notifications,
    		Notification,
    		IconicButton,
    		SoroushIcon,
    		RubikaIcon,
    		VirgoolIcon,
    		Biography,
    		SkillCard,
    		Link,
    		feedback_txt,
    		playStartAnimation,
    		InitSliders,
    		displayCards,
    		stage,
    		displayWelcomeMessage,
    		renderPage,
    		$notifications
    	});

    	$$self.$inject_state = $$props => {
    		if ("feedback_txt" in $$props) $$invalidate(0, feedback_txt = $$props.feedback_txt);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		feedback_txt,
    		$notifications,
    		renderPage,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		textarea_input_handler,
    		click_handler_3
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		// name: 'world'
    	}
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
